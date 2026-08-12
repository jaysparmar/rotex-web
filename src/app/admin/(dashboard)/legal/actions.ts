"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PUBLIC_PATH: Record<string, string> = {
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
};

export async function saveLegalPage(key: string, data: { title: string; content: string }) {
  await prisma.legalPage.update({ where: { key }, data });

  revalidatePath("/admin/legal");
  revalidatePath(`/admin/legal/${key}`);
  if (PUBLIC_PATH[key]) revalidatePath(PUBLIC_PATH[key]);
}
