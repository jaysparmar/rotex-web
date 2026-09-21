import type { StaticImageData } from "next/image";
import { prisma } from "@/lib/prisma";
import { getProductsList } from "@/lib/products-data";
import { buildSearchOr } from "@/lib/search-terms";
import { flattenDownloadItems, type DownloadItem } from "@/lib/downloads-data";
import type { ResourceItem, ResourceType } from "@/lib/resource-types";

// ─── Modal quick-suggestions (Products, Industries) ────────────────────────────

/** Empty query: curated Category suggestions. Typed query: matched Product suggestions. */
export type SuggestedItem = { slug: string; name: string; image: string | StaticImageData | null };

function dedupeByName<T extends { name: string }>(items: T[], limit: number): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

async function curatedCategories(limit: number): Promise<SuggestedItem[]> {
  const section = await prisma.homeSection.findUnique({ where: { key: "products" } });
  const categoryIds = ((section?.data as Record<string, unknown> | undefined)?.categoryIds as string[]) ?? [];
  if (categoryIds.length === 0) return [];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, slug: true, name: true, image: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));
  const ordered = categoryIds
    .map((id) => byId.get(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  return dedupeByName(ordered, limit);
}

/**
 * Industries matching a search query, shared by the modal's quick suggestions and the
 * results page's `tab=all` overview so the two never disagree about the same term.
 *
 * When `q` is empty, returns the first `limit` industry names (unfiltered "browse" list).
 * When `q` is non-empty, matches industries by name, by their sub-industries' names, or by
 * their products' name/modelNumber. An industry whose own name matches the query is returned
 * as-is. An industry matched via one or more of its sub-industry names returns just those
 * matching sub-industries. An industry that only matched via its products projects to *all*
 * of its sub-industry names (more specific), falling back to its own name when it has none.
 * A non-empty query that genuinely matches nothing returns an empty array (no fabricated
 * fallback).
 */
export async function matchingIndustryNames(q: string, limit: number): Promise<string[]> {
  const query = q.trim();

  if (!query) {
    const industries = await prisma.industry.findMany({ select: { name: true }, take: limit });
    return industries.map((i) => i.name);
  }

  const searchOr = buildSearchOr(query);
  const industries = await prisma.industry.findMany({
    where: {
      OR: [
        ...searchOr.map((term) => ({ name: { contains: term } })),
        ...searchOr.map((term) => ({ subIndustries: { some: { name: { contains: term } } } } as const)),
        ...searchOr.map((term) => ({ products: { some: { name: { contains: term } } } } as const)),
        ...searchOr.map((term) => ({ products: { some: { modelNumber: { contains: term } } } } as const)),
      ],
    },
    select: { name: true, subIndustries: { select: { name: true } } },
    take: limit,
  });

  const lowerQueries = searchOr.map((t) => t.toLowerCase());
  const includesAny = (name: string) => lowerQueries.some((q) => name.toLowerCase().includes(q));
  return Array.from(
    new Set(
      industries.flatMap((ind) => {
        if (includesAny(ind.name)) return [ind.name];
        const matchingSubIndustries = ind.subIndustries.filter((s) => includesAny(s.name));
        if (matchingSubIndustries.length > 0) return matchingSubIndustries.map((s) => s.name);
        return ind.subIndustries.length === 0 ? [ind.name] : ind.subIndustries.map((s) => s.name);
      })
    )
  ).slice(0, limit);
}

export async function getModalSuggestions(q: string): Promise<{ products: SuggestedItem[]; industries: string[] }> {
  const query = q.trim();

  const products = query
    ? (await getProductsList({ search: query, pageSize: 4 })).products.map(({ slug, name, image }) => ({
        slug,
        name,
        image,
      }))
    : await curatedCategories(4);

  const industries = query ? await matchingIndustryNames(query, 6) : [];

  return { products, industries };
}

// ─── Documents (flattened Product/ProductVariant downloads) ───────────────────

export type DocumentFilters = {
  product?: string;
  productCertificateType?: string;
  qualityCertificateType?: string;
  industry?: string;
};

export type DocumentFilterOptions = {
  products: string[];
  productCertificateTypes: string[];
  qualityCertificateTypes: string[];
  industries: string[];
};

async function getAllDownloadItems(): Promise<DownloadItem[]> {
  const [products, variants, downloadCategories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        downloads: true,
        modelNumber: true,
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        industries: { select: { name: true } },
      },
    }),
    prisma.productVariant.findMany({
      select: {
        id: true,
        downloads: true,
        industries: { select: { name: true } },
        product: {
          select: {
            name: true,
            image: true,
            modelNumber: true,
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
          },
        },
      },
    }),
    prisma.downloadCategory.findMany({ select: { id: true, name: true } }),
  ]);

  return flattenDownloadItems({ products, variants, downloadCategories });
}

function matchesQuery(item: DownloadItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.modelNo.toLowerCase().includes(q) ||
    item.product.toLowerCase().includes(q)
  );
}

export async function searchDocuments(
  q: string,
  filters: DocumentFilters,
  page: number,
  pageSize: number
): Promise<{ items: DownloadItem[]; total: number; filterOptions: DocumentFilterOptions }> {
  const all = await getAllDownloadItems();
  const query = q.trim();

  const filterOptions: DocumentFilterOptions = {
    products: Array.from(new Set(all.map((i) => i.product).filter(Boolean))),
    productCertificateTypes: Array.from(
      new Set(all.filter((i) => i.tab === "certificates").map((i) => i.categoryName).filter(Boolean))
    ),
    qualityCertificateTypes: Array.from(
      new Set(all.filter((i) => i.tab === "performance-certificates").map((i) => i.categoryName).filter(Boolean))
    ),
    industries: Array.from(new Set(all.flatMap((i) => i.industries))),
  };

  const filtered = all.filter((item) => {
    if (!matchesQuery(item, query)) return false;
    if (filters.product && item.product !== filters.product) return false;
    if (filters.productCertificateType && !(item.tab === "certificates" && item.categoryName === filters.productCertificateType)) return false;
    if (filters.qualityCertificateType && !(item.tab === "performance-certificates" && item.categoryName === filters.qualityCertificateType)) return false;
    if (filters.industry && !item.industries.includes(filters.industry)) return false;
    return true;
  });

  const start = (Math.max(1, page) - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, filterOptions };
}

// ─── Case studies / Blogs (Resource) ───────────────────────────────────────────

export async function searchResources(
  q: string,
  type: ResourceType,
  page: number,
  pageSize: number
): Promise<{ items: ResourceItem[]; total: number }> {
  const query = q.trim();
  const where = {
    type,
    published: true,
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { product: { contains: query } },
            { industry: { contains: query } },
          ],
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Math.max(1, page) - 1) * pageSize,
      take: pageSize,
    }),
    prisma.resource.count({ where }),
  ]);

  const items: ResourceItem[] = records.map((r) => ({
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    image: r.image,
    product: r.product,
    industry: r.industry,
    extraTags: (r.extraTags as string[]) ?? [],
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));

  return { items, total };
}

// ─── Jobs (JobPosting) ──────────────────────────────────────────────────────────

export type JobSummary = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  employmentType: string;
  workMode: string;
  aboutRole: string;
  whatYouDo: string[];
  whatWeLookFor: string[];
  whatYouGet: { icon: string; label: string }[];
};

export async function searchJobs(
  q: string,
  page: number,
  pageSize: number
): Promise<{ items: JobSummary[]; total: number }> {
  const query = q.trim();
  const where = {
    published: true,
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { company: { contains: query } },
            { category: { contains: query } },
            { location: { contains: query } },
          ],
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Math.max(1, page) - 1) * pageSize,
      take: pageSize,
    }),
    prisma.jobPosting.count({ where }),
  ]);

  const items: JobSummary[] = records.map((j) => ({
    id: j.id,
    company: j.company,
    title: j.title,
    category: j.category,
    location: j.location,
    tag: j.tag,
    employmentType: j.employmentType,
    workMode: j.workMode,
    aboutRole: j.aboutRole,
    whatYouDo: (j.whatYouDo as string[]) ?? [],
    whatWeLookFor: (j.whatWeLookFor as string[]) ?? [],
    whatYouGet: (j.whatYouGet as { icon: string; label: string }[]) ?? [],
  }));

  return { items, total };
}

// ─── Aggregate counts (for tab bar) ─────────────────────────────────────────────

export type SearchCounts = {
  products: number;
  documents: number;
  caseStudies: number;
  blogs: number;
  jobs: number;
  total: number;
};

export async function getSearchCounts(q: string, documentFilters: DocumentFilters): Promise<SearchCounts> {
  const [{ total: products }, { total: documents }, { total: caseStudies }, { total: blogs }, { total: jobs }] =
    await Promise.all([
      getProductsList({ search: q, page: 1, pageSize: 1 }),
      searchDocuments(q, documentFilters, 1, 1),
      searchResources(q, "case-studies", 1, 1),
      searchResources(q, "blogs", 1, 1),
      searchJobs(q, 1, 1),
    ]);

  return { products, documents, caseStudies, blogs, jobs, total: products + documents + caseStudies + blogs + jobs };
}
