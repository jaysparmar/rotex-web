"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleSupplierSectionEnabled(key: string, enabled: boolean) {
  await prisma.supplierSection.update({ where: { key }, data: { enabled } });
  revalidatePath("/admin/supplier");
  revalidatePath("/join/supplier");
}

export async function saveSupplierSection(key: string, payload: { enabled: boolean; data: unknown }) {
  await prisma.supplierSection.update({
    where: { key },
    data: { enabled: payload.enabled, data: payload.data as never },
  });

  revalidatePath("/admin/supplier");
  revalidatePath(`/admin/supplier/${key}`);
  revalidatePath("/join/supplier");
}
