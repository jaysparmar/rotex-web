import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { published: true, parentId: null },
    select: { id: true, slug: true, name: true, tagline: true, image: true },
    orderBy: { order: "asc" },
  });

  return apiSuccess({ categories }, new Date());
}
