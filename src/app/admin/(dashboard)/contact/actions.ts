"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleContactSectionEnabled(key: string, enabled: boolean) {
  await prisma.contactSection.update({ where: { key }, data: { enabled } });
  revalidatePath("/admin/contact");
  revalidatePath("/contact");
}

export async function saveContactSection(key: string, payload: { enabled: boolean; data: unknown }) {
  await prisma.contactSection.update({
    where: { key },
    data: { enabled: payload.enabled, data: payload.data as never },
  });

  revalidatePath("/admin/contact");
  revalidatePath(`/admin/contact/${key}`);
  revalidatePath("/contact");
}
