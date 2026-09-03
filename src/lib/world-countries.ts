import worldCountries from "world-countries";

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
