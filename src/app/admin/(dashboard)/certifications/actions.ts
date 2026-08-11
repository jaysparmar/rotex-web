"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateCertifications() {
  revalidatePath("/admin/certifications");
  revalidatePath("/admin/home/certifications");
}

export async function createCertification(data: { name: string; logo: string; published: boolean }) {
  await prisma.certification.create({ data });
  revalidateCertifications();
}

export async function updateCertification(
  id: string,
  data: { name: string; logo: string; published: boolean }
) {
  await prisma.certification.update({ where: { id }, data });
  revalidateCertifications();
}

export async function deleteCertification(id: string) {
  await prisma.certification.delete({ where: { id } });
  revalidateCertifications();
}

export async function toggleCertificationPublished(id: string, published: boolean) {
  await prisma.certification.update({ where: { id }, data: { published } });
  revalidateCertifications();
}
