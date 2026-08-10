import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function getCareerSection(key: string) {
  const section = await prisma.careerSection.findUnique({ where: { key } });

  if (!section) {
    return apiError("NOT_FOUND", `Section "${key}" not found`, 404);
  }

  const data = section.data as Record<string, unknown>;
  return apiSuccess({ enabled: section.enabled, ...data }, section.updatedAt);
}
