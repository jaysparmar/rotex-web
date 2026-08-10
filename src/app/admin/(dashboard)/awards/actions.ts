"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type AwardInput = {
  slug: string;
  title: string;
  description: string;
  year: string;
  image: string;
  url: string;
  published: boolean;
};

function revalidateAwards() {
  revalidatePath("/admin/awards");
  revalidatePath("/about/awards");
}

export async function createAward(data: AwardInput) {
  await prisma.award.create({ data });
  revalidateAwards();
}

export async function updateAward(id: string, data: AwardInput) {
  await prisma.award.update({ where: { id }, data });
  revalidateAwards();
}

export async function deleteAward(id: string) {
  await prisma.award.delete({ where: { id } });
  revalidateAwards();
}

export async function toggleAwardPublished(id: string, published: boolean) {
  await prisma.award.update({ where: { id }, data: { published } });
  revalidateAwards();
}
