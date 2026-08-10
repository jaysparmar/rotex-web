import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function getSupplierSection(key: string) {
  const section = await prisma.supplierSection.findUnique({ where: { key } });

  if (!section) {
    return apiError("NOT_FOUND", `Section "${key}" not found`, 404);
  }

  const data = section.data as Record<string, unknown>;
  return apiSuccess({ enabled: section.enabled, ...data }, section.updatedAt);
}
