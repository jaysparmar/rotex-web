import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getSelectedPartners } from "@/lib/partners";

export async function getContactSection(key: string) {
  const section = await prisma.contactSection.findUnique({ where: { key } });

  if (!section) {
    return apiError("NOT_FOUND", `Section "${key}" not found`, 404);
  }

  const data = section.data as Record<string, unknown>;

  if (key === "form") {
    const partners = await getSelectedPartners((data.partnerIds as string[]) ?? []);
    const logos = partners.map((p) => ({ id: p.id, src: p.logo, alt: p.name }));
    const { partnerIds: _partnerIds, ...rest } = data;
    return apiSuccess({ enabled: section.enabled, ...rest, logos }, section.updatedAt);
  }

  return apiSuccess({ enabled: section.enabled, ...data }, section.updatedAt);
}
