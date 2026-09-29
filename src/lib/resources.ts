import { prisma } from "@/lib/prisma";
import { createResourceTagResolver } from "@/lib/resource-tags";
import type { ResourceItem, ResourceType } from "@/lib/resource-types";

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
    products: resolver.resolveProducts((r.productIds as string[]) ?? []),
    industries: resolver.resolveIndustries((r.industryIds as string[]) ?? []),
    extraTags: (r.extraTags as string[]) ?? [],
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));
}
