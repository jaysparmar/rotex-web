import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const [seo, sections] = await Promise.all([
    prisma.homeSeo.findUnique({ where: { id: "home" } }),
    prisma.homeSection.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!seo) {
    return apiError("NOT_FOUND", "Home SEO config not found", 404);
  }

  const updatedAt = [seo.updatedAt, ...sections.map((s) => s.updatedAt)].sort(
    (a, b) => b.getTime() - a.getTime()
  )[0];

  return apiSuccess(
    {
      seo: seo.data,
      sections: sections.map((s) => ({ key: s.key, enabled: s.enabled, order: s.order })),
    },
    updatedAt
  );
}
