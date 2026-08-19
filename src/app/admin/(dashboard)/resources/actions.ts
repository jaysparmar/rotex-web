"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

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
  published: boolean;
  product: string;
  industry: string;
  extraTags: string[];
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
