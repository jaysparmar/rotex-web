"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function togglePartnerToolsSectionEnabled(key: string, enabled: boolean) {
  await prisma.partnerToolsSection.update({ where: { key }, data: { enabled } });
  revalidatePath("/admin/partner-sales-tools");
  revalidatePath("/join/partner-sales-tools");
}

export async function savePartnerToolsSection(key: string, payload: { enabled: boolean; data: unknown }) {
  await prisma.partnerToolsSection.update({
    where: { key },
    data: { enabled: payload.enabled, data: payload.data as never },
  });

  revalidatePath("/admin/partner-sales-tools");
  revalidatePath(`/admin/partner-sales-tools/${key}`);
  revalidatePath("/join/partner-sales-tools");
}
