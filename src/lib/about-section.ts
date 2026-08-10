import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getSelectedPartners } from "@/lib/partners";
import { getSelectedCountries } from "@/lib/countries";

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

  if (key === "trusted-countries") {
    const countries = await getSelectedCountries((data.countryIds as string[]) ?? []);
    const pins = countries.map((c) => ({ name: c.name, coordinates: [c.lng, c.lat] as [number, number] }));
    const { countryIds: _countryIds, ...rest } = data;
    return apiSuccess({ enabled: section.enabled, ...rest, pins }, section.updatedAt);
  }

  if (key === "gallery") {
    const ids = (data.mediaIds as string[]) ?? [];
    const sizes = (data.sizes as Record<string, "wide" | "narrow">) ?? {};
    const assets = ids.length ? await prisma.mediaAsset.findMany({ where: { id: { in: ids } } }) : [];
    const byId = new Map(assets.map((a) => [a.id, a]));
    const images = ids
      .map((id) => byId.get(id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map((a) => ({ src: a.url, alt: a.alt ?? "", type: a.type as "image" | "video", size: sizes[a.id] ?? "wide" }));
    return apiSuccess({ enabled: section.enabled, images }, section.updatedAt);
  }

  if (key === "achievements") {
    const ids = (data.awardIds as string[]) ?? [];
    const awards = ids.length
      ? await prisma.award.findMany({ where: { id: { in: ids }, published: true } })
      : [];
    const byId = new Map(awards.map((a) => [a.id, a]));
    const achievements = ids
      .map((id) => byId.get(id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .slice(0, 3)
      .map((a) => ({ id: a.id, title: a.title, year: a.year, image: a.image }));
    const { awardIds: _awardIds, ...rest } = data;
    return apiSuccess({ enabled: section.enabled, ...rest, achievements }, section.updatedAt);
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
