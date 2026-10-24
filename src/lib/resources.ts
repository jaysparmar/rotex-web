import { prisma } from "@/lib/prisma";
import { createResourceTagResolver } from "@/lib/resource-tags";
import type { ResourceItem, ResourceType } from "@/lib/resource-types";

// Max resources shown as "featured" per type — enforced on toggle in the admin resources actions.
export const FEATURED_RESOURCE_LIMITS: Record<ResourceType, number> = {
  blogs: 1,
  news: 4,
  "case-studies": 2,
  csr: 1,
};

export async function getPublishedResources(type: ResourceType): Promise<ResourceItem[]> {
  const [records, resolver] = await Promise.all([
    prisma.resource.findMany({
      where: { type, published: true },
      orderBy: { createdAt: "desc" },
    }),
    createResourceTagResolver(),
  ]);

  return records.map((r) => ({
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    image: r.image,
    gallery: (r.gallery as string[]) ?? [],
    products: resolver.resolveProducts((r.productIds as string[]) ?? []),
    industries: resolver.resolveIndustries((r.industryIds as string[]) ?? []),
    extraTags: (r.extraTags as string[]) ?? [],
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));
}

// Only admin-toggled featured posts — empty when none are featured, so callers can hide
// the hero section entirely rather than fake it with recent posts.
export async function getFeaturedResources(type: ResourceType): Promise<ResourceItem[]> {
  const limit = FEATURED_RESOURCE_LIMITS[type];
  const [records, resolver] = await Promise.all([
    prisma.resource.findMany({
      where: { type, published: true, featured: true },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }),
    createResourceTagResolver(),
  ]);

  return records.map((r) => ({
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    image: r.image,
    gallery: (r.gallery as string[]) ?? [],
    products: resolver.resolveProducts((r.productIds as string[]) ?? []),
    industries: resolver.resolveIndustries((r.industryIds as string[]) ?? []),
    extraTags: (r.extraTags as string[]) ?? [],
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));
}
