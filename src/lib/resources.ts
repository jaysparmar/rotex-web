import { prisma } from "@/lib/prisma";
import type { ResourceItem, ResourceType } from "@/lib/resource-types";

export async function getPublishedResources(type: ResourceType): Promise<ResourceItem[]> {
  const records = await prisma.resource.findMany({
    where: { type, published: true },
    orderBy: { createdAt: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    image: r.image,
    product: r.product,
    industry: r.industry,
    extraTags: (r.extraTags as string[]) ?? [],
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));
}
