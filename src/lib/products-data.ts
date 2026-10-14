import type { StaticImageData } from "next/image";
import { prisma } from "@/lib/prisma";
import { buildSearchOr } from "@/lib/search-terms";
import product1 from "@/assets/Images/products/product_1.png";
import type { Crumb, ProductDetail, ProductVariant as UIVariant, SpecItem } from "@/lib/product-detail-data";

export const PLACEHOLDER_PRODUCT_IMAGE: StaticImageData = product1;

export type ProductSummary = {
  slug: string;
  code: string;
  name: string;
  category: string;
  image: StaticImageData | string;
  tags: string[];
};

export type CategoryWithCount = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
};

function firstSentence(text: string, maxLen = 160): string {
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trimEnd()}…` : plain;
}

function toSummary(product: {
  slug: string;
  modelNumber: string;
  name: string;
  image: string | null;
  category: { name: string };
  subCategory: { name: string } | null;
}): ProductSummary {
  return {
    slug: product.slug,
    code: product.modelNumber,
    name: product.name,
    category: product.category.name,
    image: product.image ?? PLACEHOLDER_PRODUCT_IMAGE,
    tags: product.subCategory ? [product.subCategory.name] : [],
  };
}

/** Latest N products for the home page carousel. */
export async function getFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { category: true, subCategory: true },
  });
  return products.map(toSummary);
}

/** Categories that currently have at least one product, for the tab bar. */
export async function getCategoriesWithProducts(): Promise<CategoryWithCount[]> {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { order: "asc" },
  });
  return categories
    .filter((c) => c._count.products > 0)
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description, productCount: c._count.products }));
}

/** FAQs from every category, combined, for the products listing page FAQ section. */
export async function getCombinedCategoryFaqs(): Promise<PrismaJson.CategoryFaqs> {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { faqs: true },
  });
  return categories.flatMap((c) => c.faqs);
}

export type SubCategoryWithCount = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
};

/** Sub-categories (e.g. "2 Way", "3 Way") that currently have at least one product, optionally scoped to a category, for the "Type" filter. */
export async function getSubCategoriesWithProducts(categorySlug?: string | null): Promise<SubCategoryWithCount[]> {
  const subCategories = await prisma.subCategory.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : undefined,
    include: { _count: { select: { products: true } } },
    orderBy: { order: "asc" },
  });
  return subCategories
    .filter((s) => s._count.products > 0)
    .map((s) => ({ id: s.id, slug: s.slug, name: s.name, description: s.description, productCount: s._count.products }));
}

export type IndustryWithCount = {
  id: string;
  slug: string;
  name: string;
  productCount: number;
};

/** All industries, for the "Industry" filter — unlike the other PLP filters, this lists every
 * industry regardless of whether the active category currently has a matching product, so picking
 * one with no matches shows "No products found." rather than making that industry unselectable. */
export async function getIndustriesWithProducts(categorySlug?: string | null): Promise<IndustryWithCount[]> {
  const categoryFilter = categorySlug ? { category: { slug: categorySlug } } : {};
  const industries = await prisma.industry.findMany({ orderBy: { name: "asc" } });

  const counts = await Promise.all(
    industries.map((industry) =>
      prisma.product.count({
        where: {
          ...categoryFilter,
          OR: [
            { industries: { some: { id: industry.id } } },
            { variants: { some: { industries: { some: { id: industry.id } } } } },
          ],
        },
      })
    )
  );

  return industries.map((industry, i) => ({
    id: industry.id,
    slug: industry.slug,
    name: industry.name,
    productCount: counts[i],
  }));
}

export type ProductListFilterParams = {
  categorySlug?: string;
  subCategorySlug?: string;
  industrySlugs?: string[];
  search?: string;
  size?: string;
  variantType?: string;
  orifice?: string;
  minOperatingTemp?: string;
  maxOperatingTemp?: string;
  flowFactor?: string;
  power?: string;
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  products: ProductSummary[];
  total: number;
};

/** Paginated products, optionally scoped to a category slug and variant attributes, for the /products listing. */
export async function getProductsList(params: ProductListFilterParams = {}): Promise<ProductListResult> {
  const { categorySlug, subCategorySlug, industrySlugs, search, page = 1, pageSize = 12, ...attrs } = params;
  const attrFilter: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value) attrFilter[key] = value;
  }

  // Each whitespace-separated word of the query must match *somewhere* (AND across
  // words), but any field — name, model number, category, a variant's attributes,
  // etc — satisfies a given word (OR across fields). A plain single-substring match
  // of the whole query previously required every word in one literal phrase in a
  // single field, so e.g. "202B 2 Way" (a model number plus a variant's Type) never
  // matched anything even though both halves are individually valid.
  const searchTokens = search?.trim() ? search.trim().split(/\s+/).filter(Boolean) : [];
  const tokenConditions = searchTokens.map((token) => {
    const variants = buildSearchOr(token);
    return {
      OR: variants.flatMap((term) => [
        { name: { contains: term } },
        { modelNumber: { contains: term } },
        { description: { contains: term } },
        { features: { contains: term } },
        { category: { name: { contains: term } } },
        { subCategory: { name: { contains: term } } },
        { industries: { some: { name: { contains: term } } } },
        // Parent-attribute search — a product's own listing text may say nothing
        // about e.g. "Direct Acting" or a specific orifice size, but one of its
        // variants often does.
        { variants: { some: { variantType: { contains: term } } } },
        { variants: { some: { size: { contains: term } } } },
        { variants: { some: { orifice: { contains: term } } } },
        { variants: { some: { minOperatingTemp: { contains: term } } } },
        { variants: { some: { maxOperatingTemp: { contains: term } } } },
        { variants: { some: { flowFactor: { contains: term } } } },
        { variants: { some: { power: { contains: term } } } },
        { variants: { some: { features: { contains: term } } } },
        { variants: { some: { description: { contains: term } } } },
      ]),
    };
  });

  // Industries live on the Product itself for simple products but only on each
  // ProductVariant for variable products (see getProductBySlug) — match either.
  // Multiple industries are OR'd together (a product matching any selected industry qualifies).
  const industryFilter = industrySlugs && industrySlugs.length > 0
    ? {
        OR: [
          { industries: { some: { slug: { in: industrySlugs } } } },
          { variants: { some: { industries: { some: { slug: { in: industrySlugs } } } } } },
        ],
      }
    : null;

  const andConditions = [...(industryFilter ? [industryFilter] : []), ...tokenConditions];

  const where = {
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(subCategorySlug ? { subCategory: { slug: subCategorySlug } } : {}),
    ...(Object.keys(attrFilter).length ? { variants: { some: attrFilter } } : {}),
    ...(andConditions.length ? { AND: andConditions } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true, subCategory: true },
      skip: (Math.max(1, page) - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { products: products.map(toSummary), total };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const [product, downloadCategories] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subCategory: true,
        industries: { select: { name: true } },
        variants: { include: { industries: { select: { name: true } } } },
      },
    }),
    prisma.downloadCategory.findMany(),
  ]);
  if (!product) return null;

  const categoryNameById = new Map(downloadCategories.map((c) => [c.id, c.name]));

  const breadcrumb: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: product.category.name, href: `/products?category=${product.category.slug}` },
    { label: product.name },
  ];

  const description = product.description
    ? firstSentence(product.description)
    : product.features
      ? firstSentence(product.features)
      : `${product.category.name} model ${product.modelNumber}.`;

  const imageList = (product.images as string[] | null) ?? [];

  const industriesServed =
    product.productType === "variable"
      ? Array.from(new Set(product.variants.flatMap((v) => v.industries.map((i) => i.name))))
      : product.industries.map((i) => i.name);

  const base = {
    slug: product.slug,
    code: product.modelNumber,
    name: product.name,
    category: product.category.name,
    tags: product.subCategory ? [product.subCategory.name] : [],
    description,
    industriesServed,
    certificates: product.certificates as string[],
    images: imageList.length > 0 ? imageList : [product.image ?? PLACEHOLDER_PRODUCT_IMAGE],
    breadcrumb,
    productType: product.productType as "simple" | "variable",
  };

  if (product.productType === "variable") {
    const variants: UIVariant[] = product.variants.map((v) => ({
      id: v.id,
      size: v.size ?? "",
      variantType: v.variantType ?? "",
      orifice: v.orifice ?? "",
      minPressure: v.minOperatingTemp ?? "",
      maxPressure: v.maxOperatingTemp ?? "",
      flowFactor: v.flowFactor ?? "",
      power: v.power ?? "",
      certificates: v.certificates as string[],
      features: v.features ?? "",
      specifications: v.specifications as SpecItem[],
      downloads: (v.downloads as { title: string; url: string; categoryId: string }[]).map((d) => ({
        category: categoryNameById.get(d.categoryId) ?? "Document",
        title: d.title,
        url: d.url,
      })),
    }));
    return { ...base, variants };
  }

  return {
    ...base,
    features: product.features ?? undefined,
    specifications: product.specifications as SpecItem[],
    downloads: (product.downloads as { title: string; url: string; categoryId: string }[]).map((d) => ({
      category: categoryNameById.get(d.categoryId) ?? "Document",
      title: d.title,
      url: d.url,
    })),
  };
}
