"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ProductAttributeKey } from "@/lib/product-constants";

function revalidateAttributes() {
  revalidatePath("/admin/attributes");
}

export async function createAttributeValue(attribute: ProductAttributeKey, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return;

  const last = await prisma.attributeValue.findFirst({
    where: { attribute },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.attributeValue.create({
    data: { attribute, value: trimmed, order: (last?.order ?? -1) + 1 },
  });
  revalidateAttributes();
}

export async function deleteAttributeValue(id: string) {
  await prisma.attributeValue.delete({ where: { id } });
  revalidateAttributes();
}
