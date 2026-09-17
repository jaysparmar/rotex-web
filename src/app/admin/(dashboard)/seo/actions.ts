"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { SeoMetaData } from "@/lib/seo";

export async function saveSeoPage(key: string, data: SeoMetaData) {
  await prisma.seoPage.upsert({
    where: { key },
    update: { data: data as never },
    create: { key, data: data as never },
  });

  revalidatePath("/admin/seo");
  revalidatePath(`/admin/seo/${key}`);
}
