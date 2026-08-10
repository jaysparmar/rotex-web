"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CategoryInput = {
  name: string;
  slug: string;
  tagline: string;
  image: string;
  parentId: string | null;
  order: number;
  published: boolean;
};

function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/products");
}

function toData(input: CategoryInput) {
  return {
    name: input.name,
    slug: input.slug,
    tagline: input.tagline,
    image: input.image || null,
    parentId: input.parentId || null,
    order: input.order,
    published: input.published,
  };
}

export async function createCategory(data: CategoryInput) {
  await prisma.category.create({ data: toData(data) });
  revalidateCategories();
}

export async function updateCategory(id: string, data: CategoryInput) {
  await prisma.category.update({ where: { id }, data: toData(data) });
  revalidateCategories();
}

export async function deleteCategory(id: string) {
  const childCount = await prisma.category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new Error("Delete subcategories first");
  }
  await prisma.category.delete({ where: { id } });
  revalidateCategories();
}

export async function toggleCategoryPublished(id: string, published: boolean) {
  await prisma.category.update({ where: { id }, data: { published } });
  revalidateCategories();
}
