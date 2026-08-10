"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DownloadItemInput = {
  tab: string;
  title: string;
  language: string;
  fileType: string;
  fileSizeLabel: string;
  fileUrl: string;
  image: string;
  product: string;
  subCategory: string;
  productCertificateType: string;
  qmsCertificateType: string;
  industry: string;
  published: boolean;
};

function revalidateDownloads() {
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
}

export async function createDownloadItem(data: DownloadItemInput) {
  await prisma.downloadItem.create({ data });
  revalidateDownloads();
}

export async function updateDownloadItem(id: string, data: DownloadItemInput) {
  await prisma.downloadItem.update({ where: { id }, data });
  revalidateDownloads();
}

export async function deleteDownloadItem(id: string) {
  await prisma.downloadItem.delete({ where: { id } });
  revalidateDownloads();
}

export async function toggleDownloadItemPublished(id: string, published: boolean) {
  await prisma.downloadItem.update({ where: { id }, data: { published } });
  revalidateDownloads();
}
