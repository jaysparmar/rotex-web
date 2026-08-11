import { prisma } from "@/lib/prisma";

export async function getSelectedCertifications(ids: string[]) {
  if (ids.length === 0) return [];

  return prisma.certification.findMany({
    where: { id: { in: ids }, published: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPublishedCertifications() {
  return prisma.certification.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
  });
}
