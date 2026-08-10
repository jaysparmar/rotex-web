import { prisma } from "@/lib/prisma";

export async function getPublishedAwards() {
  return prisma.award.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
}
