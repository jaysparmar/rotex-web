"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateStories() {
  revalidatePath("/admin/customer-stories");
  revalidatePath("/admin/industries", "layout");
  revalidatePath("/industries", "layout");
}

type CustomerStoryInput = {
  quote: string;
  author: string;
  company: string;
  image: string;
  mediaType: string;
  published: boolean;
};

export async function createCustomerStory(data: CustomerStoryInput) {
  await prisma.customerStory.create({ data });
  revalidateStories();
}

export async function updateCustomerStory(id: string, data: CustomerStoryInput) {
  await prisma.customerStory.update({ where: { id }, data });
  revalidateStories();
}

export async function deleteCustomerStory(id: string) {
  await prisma.customerStory.delete({ where: { id } });
  revalidateStories();
}

export async function toggleCustomerStoryPublished(id: string, published: boolean) {
  await prisma.customerStory.update({ where: { id }, data: { published } });
  revalidateStories();
}
