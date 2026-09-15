"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleHomeSectionEnabled(key: string, enabled: boolean) {
  await prisma.homeSection.update({ where: { key }, data: { enabled } });
  revalidatePath("/admin/home");
}

export async function saveHomeSection(key: string, payload: { enabled: boolean; data: unknown }) {
  await prisma.homeSection.update({
    where: { key },
    data: { enabled: payload.enabled, data: payload.data as never },
  });

  revalidatePath("/admin/home");
  revalidatePath(`/admin/home/${key}`);
}

export async function reorderHomeSections(orderedKeys: string[]) {
  await prisma.$transaction(
    orderedKeys.map((key, index) =>
      prisma.homeSection.update({ where: { key }, data: { order: index + 1 } })
    )
  );

  revalidatePath("/admin/home");
}

export async function saveGlobalConfig(data: PrismaJson.GlobalConfigData) {
  await prisma.globalConfig.update({ where: { id: "global" }, data: { data } });

  revalidatePath("/admin/global");
}

export async function saveAdminConfig(data: PrismaJson.AdminConfigData) {
  await prisma.adminConfig.upsert({
    where: { id: "admin" },
    update: { data },
    create: { id: "admin", data },
  });

  revalidatePath("/admin", "layout");
}
