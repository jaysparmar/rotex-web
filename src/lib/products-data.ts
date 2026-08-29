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
  const trimmed = text.trim().split("\n")[0];
  return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen).trimEnd()}…` : trimmed;
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

/** All products, optionally scoped to a category slug, for the /products listing. */
export async function getProductsList(params: { categorySlug?: string } = {}): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: params.categorySlug ? { category: { slug: params.categorySlug } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true, subCategory: true },
  });
  return products.map(toSummary);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, subCategory: true, variants: true },
  });
  if (!product) return null;

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
      features: v.features ?? "",
      specifications: v.specifications as SpecItem[],
      downloads: (v.downloads as { title: string; description: string; url: string }[]).map((d) => ({
        category: d.description || "Document",
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
    downloads: (product.downloads as { title: string; description: string; url: string }[]).map((d) => ({
      category: d.description || "Document",
      title: d.title,
      url: d.url,
    })),
  };
}
