// "news" (not "news-updates") matches the type id already used by the admin
// Resource form and the About page's Resources-section picker — keep in sync.
export type ResourceType = "blogs" | "news" | "case-studies";

export type ResourceItem = {
  id: string;
  type: string;
  slug: string;
  title: string;
  image: string;
  product: string;
  industry: string;
  extraTags: string[];
  content: string;
  createdAt: string;
};

export function getResourceTags(post: ResourceItem): string[] {
  return [post.product, post.industry, ...post.extraTags].filter(Boolean);
}

export function formatResourceDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
