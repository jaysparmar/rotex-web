import worldCountries from "world-countries";
import { City } from "country-state-city";

export type Country = { name: string; code: string; dial: string; flag: string };

export const COUNTRIES: Country[] = worldCountries
  .filter((c) => c.idd?.root)
  .map((c) => ({
    name: c.name.common,
    code: c.cca2,
    dial: `${c.idd.root}${c.idd.suffixes?.[0] ?? ""}`,
    flag: c.flag,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_NAMES: string[] = COUNTRIES.map((c) => c.name);

const COUNTRY_CODE_BY_NAME = new Map(COUNTRIES.map((c) => [c.name, c.code]));

/** Cities for a country, looked up by its display name (as stored in form state). Empty until a country is picked. */
export function getCitiesForCountry(countryName: string): string[] {
  const isoCode = COUNTRY_CODE_BY_NAME.get(countryName);
  if (!isoCode) return [];
  return City.getCitiesOfCountry(isoCode)?.map((c) => c.name).sort((a, b) => a.localeCompare(b)) ?? [];
}
