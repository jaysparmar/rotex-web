import type { StaticImageData } from "next/image";
import { prisma } from "@/lib/prisma";
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
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, productCount: c._count.products }));
}

export type SubCategoryWithCount = {
  id: string;
  slug: string;
  name: string;
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
    .map((s) => ({ id: s.id, slug: s.slug, name: s.name, productCount: s._count.products }));
}

export type ProductListFilterParams = {
  categorySlug?: string;
  subCategorySlug?: string;
  search?: string;
  size?: string;
  variantType?: string;
  orifice?: string;
  minOperatingTemp?: string;
  maxOperatingTemp?: string;
  flowFactor?: string;
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  products: ProductSummary[];
  total: number;
};

/** Paginated products, optionally scoped to a category slug and variant attributes, for the /products listing. */
export async function getProductsList(params: ProductListFilterParams = {}): Promise<ProductListResult> {
  const { categorySlug, subCategorySlug, search, page = 1, pageSize = 12, ...attrs } = params;
  const attrFilter: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value) attrFilter[key] = value;
  }

  const where = {
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(subCategorySlug ? { subCategory: { slug: subCategorySlug } } : {}),
    ...(Object.keys(attrFilter).length ? { variants: { some: attrFilter } } : {}),
    ...(search?.trim()
      ? {
          OR: [
            { name: { contains: search.trim() } },
            { modelNumber: { contains: search.trim() } },
          ],
        }
      : {}),
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
      include: { category: true, subCategory: true, variants: true },
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

  const description = product.features
    ? firstSentence(product.features)
    : `${product.category.name} model ${product.modelNumber}.`;

  const base = {
    slug: product.slug,
    code: product.modelNumber,
    name: product.name,
    category: product.category.name,
    tags: product.subCategory ? [product.subCategory.name] : [],
    description,
    industriesServed: product.industriesServed ? product.industriesServed.split(",").map((s) => s.trim()).filter(Boolean) : [],
    certificates: product.certificates as string[],
    images: [product.image ?? PLACEHOLDER_PRODUCT_IMAGE],
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
