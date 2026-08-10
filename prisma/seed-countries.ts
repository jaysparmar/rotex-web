import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

type CountrySeed = {
  id: string;
  name: string;
  stateOrCity?: string;
  partnerCompany?: string;
  lat: number;
  lng: number;
};

// Shown on the About Us trusted-countries globe — name + coordinates only.
const ABOUT_COUNTRIES: CountrySeed[] = [
  { id: "ctry-uk", name: "United Kingdom", lat: 54.5, lng: -2.5 },
  { id: "ctry-nl", name: "Netherlands", lat: 52.13, lng: 5.29 },
  { id: "ctry-uae", name: "UAE", lat: 23.9, lng: 54.3 },
  { id: "ctry-sa", name: "Saudi Arabia", lat: 23.89, lng: 45.08 },
  { id: "ctry-in", name: "India", lat: 20.59, lng: 78.96 },
  { id: "ctry-my", name: "Malaysia", lat: 4.21, lng: 101.98 },
];

// Shown on the Channel Partner map — name + stateOrCity + partnerCompany.
const CHANNEL_PARTNER_COUNTRIES: CountrySeed[] = [
  { id: "cpm-canada", name: "Canada", partnerCompany: "Peerless Engineering", lat: 45, lng: -100 },
  { id: "cpm-kazakhstan", name: "Kazakhstan", partnerCompany: "Seastar International LLP", lat: 48, lng: 67 },
  { id: "cpm-uzbekistan", name: "Uzbekistan", partnerCompany: "Eurolux", lat: 41, lng: 64 },
  { id: "cpm-azerbaijan", name: "Azerbaijan", partnerCompany: "Barama", lat: 40.1, lng: 47.5 },
  { id: "cpm-poland", name: "Poland", partnerCompany: "Rectus Polska", lat: 52, lng: 19 },
  { id: "cpm-czech", name: "Czech Republic", partnerCompany: "Profitex s.r.o", lat: 49.8, lng: 15.5 },
  { id: "cpm-prague", name: "Prague", partnerCompany: "OEM Automatic", lat: 50.1, lng: 14.4 },
  { id: "cpm-slovakia", name: "Slovakia", partnerCompany: "REGADA s.r.o", lat: 48.7, lng: 19.7 },
  { id: "cpm-romania", name: "Romania", partnerCompany: "Roconsult Tech SRL", lat: 46, lng: 25 },
  { id: "cpm-lithuania", name: "Lithuania", partnerCompany: "UAB Skydas", lat: 55.2, lng: 24 },
  { id: "cpm-turkey", name: "Turkey", partnerCompany: "Meteser Otomasyon", lat: 39, lng: 35 },
  { id: "cpm-indonesia", name: "Indonesia", partnerCompany: "PT. Ersada Valve Utama", lat: -0.8, lng: 113.9 },
  { id: "cpm-singapore", name: "Singapore", partnerCompany: "Bliss Flow Systems (S) Pte Ltd", lat: 1.35, lng: 103.8 },
  { id: "cpm-malaysia", name: "Malaysia", partnerCompany: "Wawansan Gas SDN BHD", lat: 4.21, lng: 101.98 },
  { id: "cpm-thailand", name: "Thailand", partnerCompany: "HKK Instrumentation Technologies", lat: 15, lng: 101 },
  { id: "cpm-vietnam", name: "Vietnam", partnerCompany: "Tri Vu Equipment Co. Ltd", lat: 16, lng: 108 },
  { id: "cpm-philippines", name: "Philippines", partnerCompany: "ATEX Automation & Technologies Corp.", lat: 12, lng: 122 },
  { id: "cpm-south-korea", name: "South Korea", partnerCompany: "Brantech", lat: 36.5, lng: 127.8 },
  { id: "cpm-china", name: "China", stateOrCity: "Suzhou", partnerCompany: "Flutech-RTX", lat: 31.3, lng: 120.6 },
  { id: "cpm-uae", name: "UAE", partnerCompany: "Aman Engineering", lat: 23.9, lng: 54.3 },
  { id: "cpm-oman", name: "Oman", partnerCompany: "Technical Supplies International", lat: 21, lng: 56 },
  { id: "cpm-qatar", name: "Qatar", partnerCompany: "Qatar Hydraulic Co. LLC", lat: 25.3, lng: 51.2 },
  { id: "cpm-bahrain", name: "Bahrain", partnerCompany: "Al Bakali General Trading", lat: 26, lng: 50.5 },
  { id: "cpm-kuwait", name: "Kuwait", partnerCompany: "Texel Engineering", lat: 29.3, lng: 47.5 },
  { id: "cpm-australia", name: "Australia", partnerCompany: "Powerflo Solutions Pty Ltd", lat: -26, lng: 134 },
];

async function upsertCountry(c: CountrySeed) {
  await prisma.country.upsert({
    where: { id: c.id },
    update: {
      name: c.name,
      stateOrCity: c.stateOrCity ?? null,
      partnerCompany: c.partnerCompany ?? null,
      lat: c.lat,
      lng: c.lng,
    },
    create: {
      id: c.id,
      name: c.name,
      stateOrCity: c.stateOrCity ?? null,
      partnerCompany: c.partnerCompany ?? null,
      lat: c.lat,
      lng: c.lng,
      published: true,
    },
  });
}

async function main() {
  for (const c of [...ABOUT_COUNTRIES, ...CHANNEL_PARTNER_COUNTRIES]) {
    await upsertCountry(c);
  }

  const trustedCountries = await prisma.aboutSection.findUnique({ where: { key: "trusted-countries" } });
  if (trustedCountries) {
    const data = trustedCountries.data as Record<string, unknown>;
    await prisma.aboutSection.update({
      where: { key: "trusted-countries" },
      data: { data: { ...data, countryIds: ABOUT_COUNTRIES.map((c) => c.id) } as never },
    });
  }

  const channelPartnerMap = await prisma.channelPartnerSection.findUnique({ where: { key: "map" } });
  if (channelPartnerMap) {
    const data = channelPartnerMap.data as Record<string, unknown>;
    await prisma.channelPartnerSection.update({
      where: { key: "map" },
      data: { data: { ...data, countryIds: CHANNEL_PARTNER_COUNTRIES.map((c) => c.id) } as never },
    });
  }

  console.log(
    `Seeded ${ABOUT_COUNTRIES.length + CHANNEL_PARTNER_COUNTRIES.length} countries, patched trusted-countries and channel-partner map sections.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
