import type { Crumb } from "./product-detail-data";

export function productHref(slug: string, category: string): string {
  return `/product/${slug}?category=${encodeURIComponent(category)}`;
}

export function crumbsFromCategory(category: string | null): Crumb[] | undefined {
  if (!category) return undefined;
  return [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: category },
  ];
}
