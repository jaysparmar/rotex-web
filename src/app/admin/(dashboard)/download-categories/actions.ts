"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateDownloadCategories() {
  revalidatePath("/admin/download-categories");
  revalidatePath("/admin/products");
}

export async function createDownloadCategory(data: { name: string }) {
  await prisma.downloadCategory.create({ data });
  revalidateDownloadCategories();
}

export async function updateDownloadCategory(id: string, data: { name: string }) {
  await prisma.downloadCategory.update({ where: { id }, data });
  revalidateDownloadCategories();
}

export async function deleteDownloadCategory(id: string) {
  await prisma.downloadCategory.delete({ where: { id } });
  revalidateDownloadCategories();
}
