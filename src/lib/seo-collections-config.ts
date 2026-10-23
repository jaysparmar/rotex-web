// Client-safe: no prisma import. Server-side lookups live in seo-collections.ts.

export const RESOURCE_TYPE_BY_COLLECTION: Record<string, string> = {
  blogs: "blogs",
  "case-studies": "case-studies",
  "news-updates": "news",
  csr: "csr",
};

export const RESOURCE_BASE_PATH: Record<string, string> = {
  blogs: "/blogs",
  "case-studies": "/case-studies",
  news: "/news-updates",
  csr: "/csr",
};

export function productSeoKey(slug: string) {
  return `product/${slug}`;
}

export function categorySeoKey(slug: string) {
  return `category/${slug}`;
}

export function industrySeoKey(sector: string, sub?: string) {
  return sub ? `industry/${sector}/${sub}` : `industry/${sector}`;
}

export function resourceSeoKey(type: string, slug: string) {
  return `resource/${type}/${slug}`;
}

export type SeoCollectionId =
  | "products"
  | "categories"
  | "industries"
  | "sub-industries"
  | "blogs"
  | "case-studies"
  | "news-updates"
  | "csr";

export const SEO_COLLECTIONS: { id: SeoCollectionId; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "industries", label: "Industries" },
  { id: "sub-industries", label: "Sub-Industries" },
  { id: "blogs", label: "Blogs" },
  { id: "case-studies", label: "Case Studies" },
  { id: "news-updates", label: "News & Updates" },
  { id: "csr", label: "CSR" },
];
