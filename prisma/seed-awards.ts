import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const AWARD_URL = "https://rotex.ezzystack.com/";

const AWARDS: { slug: string; year: string; title: string; description: string; image: string; url: string }[] = [
  {
    slug: "rail-analysis-innovation-100-2025",
    url: AWARD_URL,
    year: "2025",
    title: "Rail Analysis Innovation-100 (2025 Edition)",
    description: 'Featured as one of the "100 Innovative Companies in the Rail Sector of India".',
    image: "/media/awards/1.jpg",
  },
  {
    slug: "2nd-best-display-of-products-award-2025",
    url: AWARD_URL,
    year: "2025",
    title: "2nd Best Display of Products Award",
    description:
      "Rotex wins the 2nd Prize for Best Product Display at Dahej Industrial Expo 2025 for the second consecutive year.",
    image: "/media/awards/2.jpg",
  },
  {
    slug: "zed-bronze-certificate-unit-2-2025",
    url: AWARD_URL,
    year: "2025",
    title: "Bronze Certificate (Unit-II)",
    description: "Quality and compliance recognition for the manufacturing unit.",
    image: "/media/awards/3.jpg",
  },
  {
    slug: "1st-runner-up-isq-tops-convention-2025",
    url: AWARD_URL,
    year: "2025",
    title: "1st Runner-Up at ISQ TOPS Convention 2025",
    description:
      '1st Runner-Up at the National-Level Indian Society for Quality (ISQ) Competition for the "Aarambh" Case Study.',
    image: "/media/awards/4.jpg",
  },
  {
    slug: "leaders-of-tomorrow-awards-season-11-2024",
    url: AWARD_URL,
    year: "2024",
    title: "Leaders of Tomorrow Awards (Season 11)",
    description: "Winner in the Automobiles & OEM Category for exceptional contributions to the SME sector.",
    image: "/media/awards/5.jpg",
  },
  {
    slug: "2nd-best-display-of-products-award-2024",
    url: AWARD_URL,
    year: "2024",
    title: "2nd Best Display of Products Award",
    description: "Recognition for innovation and quality in showcasing engineering solutions at the Dahej Industrial Expo 2024.",
    image: "/media/awards/6.jpg",
  },
  {
    slug: "cii-design-excellence-award-2022",
    url: AWARD_URL,
    year: "2022",
    title: "CII Design Excellence Award 2022",
    description: 'Sub-category winner for "Automobile Accessory Design" under Mobility Design for the Rotex Tyre Inflation System (RTIS).',
    image: "/media/awards/7.jpg",
  },
];

const FEATURED_SLUGS = [
  "rail-analysis-innovation-100-2025",
  "zed-bronze-certificate-unit-2-2025",
  "1st-runner-up-isq-tops-convention-2025",
];

async function main() {
  for (const award of AWARDS) {
    await prisma.award.upsert({
      where: { slug: award.slug },
      update: award,
      create: { ...award, published: true },
    });
  }

  console.log(`Seeded ${AWARDS.length} awards.`);

  const achievements = await prisma.aboutSection.findUnique({ where: { key: "achievements" } });
  if (achievements) {
    const featured = await prisma.award.findMany({ where: { slug: { in: FEATURED_SLUGS } } });
    const byId = new Map(featured.map((a) => [a.slug, a.id]));
    const awardIds = FEATURED_SLUGS.map((slug) => byId.get(slug)).filter((id): id is string => Boolean(id));
    const data = achievements.data as Record<string, unknown>;
    await prisma.aboutSection.update({
      where: { key: "achievements" },
      data: { data: { ...data, awardIds } as never },
    });
    console.log(`Featured ${awardIds.length} awards in the About achievements section.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
