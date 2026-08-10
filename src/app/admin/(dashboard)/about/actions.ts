"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleAboutSectionEnabled(key: string, enabled: boolean) {
  await prisma.aboutSection.update({ where: { key }, data: { enabled } });
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

export async function saveAboutSection(key: string, payload: { enabled: boolean; data: unknown }) {
  await prisma.aboutSection.update({
    where: { key },
    data: { enabled: payload.enabled, data: payload.data as never },
  });

  revalidatePath("/admin/about");
  revalidatePath(`/admin/about/${key}`);
  revalidatePath("/about");
  if (key === "awards") revalidatePath("/admin/awards");
}
