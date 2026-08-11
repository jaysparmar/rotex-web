import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getSelectedPartners } from "@/lib/partners";
import { getSelectedCertifications } from "@/lib/certifications";

export async function getHomeSection(key: string) {
  const section = await prisma.homeSection.findUnique({ where: { key } });

  if (!section) {
    return apiError("NOT_FOUND", `Section "${key}" not found`, 404);
  }

  const data = section.data as Record<string, unknown>;

  if (key === "partners") {
    const partners = await getSelectedPartners((data.partnerIds as string[]) ?? []);
    const logos = partners.map((p) => ({ id: p.id, src: p.logo, alt: p.name }));
    return apiSuccess(
      { enabled: section.enabled, order: section.order, title: data.title, description: data.description, logos },
      section.updatedAt
    );
  }

  if (key === "certifications") {
    const certifications = await getSelectedCertifications((data.certificationIds as string[]) ?? []);
    const logos = certifications.map((c) => ({ id: c.id, src: c.logo, alt: c.name }));
    return apiSuccess(
      { enabled: section.enabled, order: section.order, title: data.title, description: data.description, logos },
      section.updatedAt
    );
  }

  if (key === "customer-stories") {
    const storyIds = (data.storyIds as string[]) ?? [];
    const stories = storyIds.length
      ? await prisma.customerStory.findMany({
          where: { id: { in: storyIds }, published: true },
          orderBy: { createdAt: "asc" },
        })
      : [];
    return apiSuccess(
      { enabled: section.enabled, order: section.order, heading: data.heading, stories },
      section.updatedAt
    );
  }

  if (key === "resources") {
    const tabs = (data.tabs as { id: string; label: string; cta: { label: string; href: string }; resourceIds?: string[] }[]) ?? [];
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
    return apiSuccess(
      { enabled: section.enabled, order: section.order, heading: data.heading, tabs: resolvedTabs },
      section.updatedAt
    );
  }

  if (key === "hero") {
    const firstEnabled = await prisma.homeSection.findFirst({
      where: { enabled: true },
      orderBy: { order: "asc" },
      select: { key: true },
    });
    return apiSuccess(
      { enabled: section.enabled, order: section.order, isFirst: firstEnabled?.key === "hero", ...data },
      section.updatedAt
    );
  }

  return apiSuccess({ enabled: section.enabled, order: section.order, ...data }, section.updatedAt);
}
