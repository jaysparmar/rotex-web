"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleChannelPartnerSectionEnabled(key: string, enabled: boolean) {
  await prisma.channelPartnerSection.update({ where: { key }, data: { enabled } });
  revalidatePath("/admin/channel-partner");
  revalidatePath("/join/channel-partner");
}

export async function saveChannelPartnerSection(key: string, payload: { enabled: boolean; data: unknown }) {
  await prisma.channelPartnerSection.update({
    where: { key },
    data: { enabled: payload.enabled, data: payload.data as never },
  });

  revalidatePath("/admin/channel-partner");
  revalidatePath(`/admin/channel-partner/${key}`);
  revalidatePath("/join/channel-partner");
}
