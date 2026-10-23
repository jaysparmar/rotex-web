import { prisma } from "@/lib/prisma";
import { SEO_PAGES } from "@/lib/seo";
import {
  RESOURCE_TYPE_BY_COLLECTION,
  RESOURCE_BASE_PATH,
  productSeoKey,
  categorySeoKey,
  industrySeoKey,
  resourceSeoKey,
  type SeoCollectionId,
} from "@/lib/seo-collections-config";

export {
  RESOURCE_TYPE_BY_COLLECTION,
  RESOURCE_BASE_PATH,
  productSeoKey,
  categorySeoKey,
  industrySeoKey,
  resourceSeoKey,
  SEO_COLLECTIONS,
  type SeoCollectionId,
} from "@/lib/seo-collections-config";

export type SeoCollectionItem = { key: string; label: string; sub?: string; path: string };

export async function listSeoCollectionItems(id: SeoCollectionId): Promise<SeoCollectionItem[]> {
  switch (id) {
    case "products": {
      const rows = await prisma.product.findMany({
        select: { slug: true, name: true, modelNumber: true },
        orderBy: { name: "asc" },
      });
      return rows.map((p) => ({
        key: productSeoKey(p.slug),
        label: p.name,
        sub: p.modelNumber,
        path: `/product/${p.slug}`,
      }));
    }
    case "categories": {
      const rows = await prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } });
      return rows.map((c) => ({
        key: categorySeoKey(c.slug),
        label: c.name,
        path: `/products?category=${c.slug}`,
      }));
    }
    case "industries": {
      const rows = await prisma.industry.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } });
      return rows.map((i) => ({ key: industrySeoKey(i.slug), label: i.name, path: `/industries/${i.slug}` }));
    }
    case "sub-industries": {
      const rows = await prisma.subIndustry.findMany({
        select: { slug: true, name: true, industry: { select: { slug: true, name: true } } },
        orderBy: { name: "asc" },
      });
      return rows.map((s) => ({
        key: industrySeoKey(s.industry.slug, s.slug),
        label: s.name,
        sub: s.industry.name,
        path: `/industries/${s.industry.slug}/${s.slug}`,
      }));
    }
    case "blogs":
    case "case-studies":
    case "news-updates":
    case "csr": {
      const type = RESOURCE_TYPE_BY_COLLECTION[id];
      const rows = await prisma.resource.findMany({
        where: { type },
        select: { slug: true, title: true },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((r) => ({
        key: resourceSeoKey(type, r.slug),
        label: r.title,
        path: `${RESOURCE_BASE_PATH[type]}/${r.slug}`,
      }));
    }
    default:
      return [];
  }
}

/** Resolves a label + live site path for any SeoPage key, static or dynamic. */
export async function resolveSeoTarget(key: string): Promise<{ label: string; path: string } | null> {
  const staticPage = SEO_PAGES.find((p) => p.key === key);
  if (staticPage) return staticPage;

  const parts = key.split("/");

  if (parts[0] === "product" && parts.length === 2) {
    const [, slug] = parts;
    const product = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
    return product ? { label: product.name, path: `/product/${slug}` } : null;
  }

  if (parts[0] === "category" && parts.length === 2) {
    const [, slug] = parts;
    const category = await prisma.category.findFirst({ where: { slug }, select: { name: true } });
    return category ? { label: category.name, path: `/products?category=${slug}` } : null;
  }

  if (parts[0] === "industry" && parts.length === 2) {
    const [, sector] = parts;
    const industry = await prisma.industry.findUnique({ where: { slug: sector }, select: { name: true } });
    return industry ? { label: industry.name, path: `/industries/${sector}` } : null;
  }

  if (parts[0] === "industry" && parts.length === 3) {
    const [, sector, sub] = parts;
    const industry = await prisma.industry.findUnique({ where: { slug: sector }, select: { id: true, name: true } });
    if (!industry) return null;
    const subIndustry = await prisma.subIndustry.findUnique({
      where: { industryId_slug: { industryId: industry.id, slug: sub } },
      select: { name: true },
    });
    return subIndustry
      ? { label: `${industry.name} / ${subIndustry.name}`, path: `/industries/${sector}/${sub}` }
      : null;
  }

  if (parts[0] === "resource" && parts.length === 3) {
    const [, type, slug] = parts;
    const resource = await prisma.resource.findUnique({ where: { type_slug: { type, slug } }, select: { title: true } });
    const basePath = RESOURCE_BASE_PATH[type];
    return resource && basePath ? { label: resource.title, path: `${basePath}/${slug}` } : null;
  }

  return null;
}
