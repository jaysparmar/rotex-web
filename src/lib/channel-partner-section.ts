import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getSelectedCountries } from "@/lib/countries";
import { getSelectedCustomerStories } from "@/lib/customer-stories";

export async function getChannelPartnerSection(key: string) {
  const section = await prisma.channelPartnerSection.findUnique({ where: { key } });

  if (!section) {
    return apiError("NOT_FOUND", `Section "${key}" not found`, 404);
  }

  const data = section.data as Record<string, unknown>;

  if (key === "map") {
    const countries = await getSelectedCountries((data.countryIds as string[]) ?? []);
    const pins = countries.map((c) => ({
      name: c.name,
      stateOrCity: c.stateOrCity,
      partnerCompany: c.partnerCompany,
      coordinates: [c.lng, c.lat] as [number, number],
    }));
    const { countryIds: _countryIds, ...rest } = data;
    return apiSuccess({ enabled: section.enabled, ...rest, pins }, section.updatedAt);
  }

  if (key === "stories") {
    const stories = await getSelectedCustomerStories((data.storyIds as string[]) ?? []);
    const { storyIds: _storyIds, ...rest } = data;
    return apiSuccess({ enabled: section.enabled, ...rest, stories }, section.updatedAt);
  }

  return apiSuccess({ enabled: section.enabled, ...data }, section.updatedAt);
}
