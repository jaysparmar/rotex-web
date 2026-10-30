import type { Crumb } from "./product-detail-data";

export function productHref(slug: string, categorySlug: string, categoryName: string): string {
  return `/product/${slug}?category=${encodeURIComponent(categorySlug)}&categoryName=${encodeURIComponent(categoryName)}`;
}

export function crumbsFromCategory(categorySlug: string | null, categoryName: string | null): Crumb[] | undefined {
  if (!categorySlug) return undefined;
  return [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: categoryName ?? categorySlug, href: `/products?category=${encodeURIComponent(categorySlug)}` },
  ];
}
