"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleCareerSectionEnabled(key: string, enabled: boolean) {
  await prisma.careerSection.update({ where: { key }, data: { enabled } });
  revalidatePath("/admin/career");
  revalidatePath("/join/career");
}

export async function saveCareerSection(key: string, payload: { enabled: boolean; data: unknown }) {
  await prisma.careerSection.update({
    where: { key },
    data: { enabled: payload.enabled, data: payload.data as never },
  });

  revalidatePath("/admin/career");
  revalidatePath(`/admin/career/${key}`);
  revalidatePath("/join/career");
}
