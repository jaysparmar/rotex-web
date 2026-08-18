"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type IndustryData = {
  name: string;
  slug: string;
  bgKey?: string;
  image?: string;
  mobileImage?: string;
  description: string;
  sectionTitle: string;
  overview: string;
  stats: { value: string; suffix?: string; label: string }[];
  whyChoose: { title: string; highlight: string; cards: { title: string; description: string }[] };
};

type SubIndustryData = {
  slug: string;
  name: string;
  description: string;
  image?: string;
  mobileImage?: string;
  partnerIds: string[];
  storyIds: string[];
  challengesTitle: string;
  solutionsTitle: string;
  challenges: { title: string; description: string }[];
  solutions: { title: string; description: string }[];
};

function revalidateIndustry(slug: string) {
  revalidatePath("/admin/industries");
  revalidatePath("/");
  revalidatePath(`/industries/${slug}`, "layout");
}

export async function createIndustry(data: IndustryData) {
  const industry = await prisma.industry.create({ data });
  revalidateIndustry(industry.slug);
  return { id: industry.id };
}

export async function updateIndustry(id: string, data: IndustryData) {
  const industry = await prisma.industry.update({ where: { id }, data });
  revalidateIndustry(industry.slug);
}

export async function deleteIndustry(id: string) {
  const industry = await prisma.industry.delete({ where: { id } });
  revalidateIndustry(industry.slug);
}

export async function createSubIndustry(industryId: string, data: SubIndustryData) {
  const industry = await prisma.industry.findUniqueOrThrow({ where: { id: industryId } });
  const subIndustry = await prisma.subIndustry.create({
    data: {
      ...data,
      recommendedProducts: [],
      industryId,
    },
  });

  revalidateIndustry(industry.slug);
  return { id: subIndustry.id };
}

export async function updateSubIndustry(id: string, data: SubIndustryData) {
  const subIndustry = await prisma.subIndustry.update({
    where: { id },
    data,
    include: { industry: true },
  });

  revalidateIndustry(subIndustry.industry.slug);
}

export async function deleteSubIndustry(id: string) {
  const subIndustry = await prisma.subIndustry.delete({ where: { id }, include: { industry: true } });
  revalidateIndustry(subIndustry.industry.slug);
}
