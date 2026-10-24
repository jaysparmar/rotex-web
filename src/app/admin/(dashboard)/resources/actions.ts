"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { FEATURED_RESOURCE_LIMITS } from "@/lib/resources";
import type { ResourceType } from "@/lib/resource-types";

function revalidateResources() {
  revalidatePath("/admin/resources");
  revalidatePath("/admin/home", "layout");
  revalidatePath("/", "layout");
}

export type ResourceInput = {
  type: string;
  title: string;
  slug: string;
  image: string;
  gallery: { url: string; size?: "wide" | "narrow" }[];
  published: boolean;
  productIds: string[];
  industryIds: string[];
  extraTags: string[];
  relatedIds: string[];
  content: string;
};

export async function createResource(data: ResourceInput) {
  const slug = data.slug.trim() ? slugify(data.slug) : slugify(data.title);
  const created = await prisma.resource.create({ data: { ...data, slug } });
  revalidateResources();
  return created;
}

export async function updateResource(id: string, data: ResourceInput) {
  const slug = data.slug.trim() ? slugify(data.slug) : slugify(data.title);
  await prisma.resource.update({ where: { id }, data: { ...data, slug } });
  revalidateResources();
}

export async function deleteResource(id: string) {
  await prisma.resource.delete({ where: { id } });
  revalidateResources();
}

export async function toggleResourcePublished(id: string, published: boolean) {
  await prisma.resource.update({ where: { id }, data: { published } });
  revalidateResources();
}

// Featuring beyond the type's limit auto-unfeatures the oldest-featured item(s) of that
// type to make room, rather than blocking the admin — see FEATURED_RESOURCE_LIMITS.
export async function toggleResourceFeatured(id: string, featured: boolean) {
  if (featured) {
    const resource = await prisma.resource.findUniqueOrThrow({ where: { id }, select: { type: true } });
    const limit = FEATURED_RESOURCE_LIMITS[resource.type as ResourceType] ?? 0;
    const currentlyFeatured = await prisma.resource.findMany({
      where: { type: resource.type, featured: true, id: { not: id } },
      orderBy: { updatedAt: "asc" },
      select: { id: true },
    });
    const overflow = currentlyFeatured.length - (limit - 1);
    if (overflow > 0) {
      const toUnfeature = currentlyFeatured.slice(0, overflow).map((r) => r.id);
      await prisma.resource.updateMany({ where: { id: { in: toUnfeature } }, data: { featured: false } });
    }
  }
  await prisma.resource.update({ where: { id }, data: { featured } });
  revalidateResources();
}
