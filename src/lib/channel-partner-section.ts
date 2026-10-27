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

    // Countries sharing a `region` collapse into a single pin whose popup
    // lists every country/company pair; a country with no region keeps its
    // own standalone pin, same as before this field existed.
    type RegionPin = {
      name: string;
      entries: { country: string; company: string | null }[];
      lat: number;
      lng: number;
      count: number;
    };
    const regionPins = new Map<string, RegionPin>();
    const standalonePins: { name: string; stateOrCity: string | null; partnerCompany: string | null; coordinates: [number, number] }[] = [];

    for (const c of countries) {
      if (c.region) {
        const existing = regionPins.get(c.region);
        if (existing) {
          existing.entries.push({ country: c.stateOrCity ?? c.name, company: c.partnerCompany });
          existing.lat += c.lat;
          existing.lng += c.lng;
          existing.count += 1;
        } else {
          regionPins.set(c.region, {
            name: c.region,
            entries: [{ country: c.stateOrCity ?? c.name, company: c.partnerCompany }],
            lat: c.lat,
            lng: c.lng,
            count: 1,
          });
        }
      } else {
        standalonePins.push({
          name: c.name,
          stateOrCity: c.stateOrCity,
          partnerCompany: c.partnerCompany,
          coordinates: [c.lng, c.lat],
        });
      }
    }

    const groupedPins = Array.from(regionPins.values()).map((r) => ({
      name: r.name,
      entries: r.entries,
      coordinates: [r.lng / r.count, r.lat / r.count] as [number, number],
    }));

    const pins = [...groupedPins, ...standalonePins];
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
