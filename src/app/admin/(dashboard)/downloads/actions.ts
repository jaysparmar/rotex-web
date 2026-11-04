"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateDownloads() {
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
}

export async function createDownload(data: { title: string; fileUrl: string; tab: string | null; categoryId: string }) {
  await prisma.download.create({ data });
  revalidateDownloads();
}

export async function updateDownload(id: string, data: { title: string; fileUrl: string; tab: string | null; categoryId: string }) {
  await prisma.download.update({ where: { id }, data });
  revalidateDownloads();
}

export async function deleteDownload(id: string) {
  await prisma.download.delete({ where: { id } });
  revalidateDownloads();
}
