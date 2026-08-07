import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getSelectedPartners } from "@/lib/partners";

export async function getAboutSection(key: string) {
  const section = await prisma.aboutSection.findUnique({ where: { key } });

  if (!section) {
    return apiError("NOT_FOUND", `Section "${key}" not found`, 404);
  }

  const data = section.data as Record<string, unknown>;

  if (key === "story") {
    const partners = await getSelectedPartners((data.partnerIds as string[]) ?? []);
    const logos = partners.map((p) => ({ id: p.id, src: p.logo, alt: p.name }));
    const { partnerIds: _partnerIds, ...rest } = data;
    return apiSuccess({ enabled: section.enabled, ...rest, logos }, section.updatedAt);
  }

  if (key === "resources") {
    const tabs =
      (data.tabs as { id: string; label: string; cta: { label: string; href: string }; resourceIds?: string[] }[]) ?? [];
    const resolvedTabs = await Promise.all(
      tabs.map(async (tab) => {
        const ids = tab.resourceIds ?? [];
        const resources = ids.length
          ? await prisma.resource.findMany({ where: { id: { in: ids }, published: true } })
          : [];
        const byId = new Map(resources.map((r) => [r.id, r]));
        const ordered = ids.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
        return { id: tab.id, label: tab.label, cta: tab.cta, resources: ordered };
      })
    );
    return apiSuccess({ enabled: section.enabled, heading: data.heading, tabs: resolvedTabs }, section.updatedAt);
  }

  return apiSuccess({ enabled: section.enabled, ...data }, section.updatedAt);
}
