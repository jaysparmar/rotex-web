import { prisma } from "@/lib/prisma";

export async function getSelectedCountries(ids: string[]) {
  if (ids.length === 0) return [];

  return prisma.country.findMany({
    where: { id: { in: ids }, published: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPublishedCountries() {
  return prisma.country.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
  });
}
