import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  const industries = await prisma.industry.findMany({
    select: { id: true, slug: true, name: true, description: true, image: true, mobileImage: true },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess({ industries }, new Date());
}
