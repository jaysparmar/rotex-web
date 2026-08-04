// Restores the real content snapshot in prisma/seed-data/*.json into the db.
// This is the client's actual production content (industries, home page,
// partners, customer stories, resources) captured via scripts/export-seed-data.ts
// so a fresh/empty db (new deploy, reset migration) always comes back with the
// real site content instead of empty tables or placeholder data.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const DATA_DIR = path.join(__dirname, "seed-data");

function load<T>(name: string): T[] {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

async function main() {
  const globalConfig = load<any>("globalConfig");
  const adminConfig = load<any>("adminConfig");
  const homeSeo = load<any>("homeSeo");
  const homeSections = load<any>("homeSections");
  const partners = load<any>("partners");
  const customerStories = load<any>("customerStories");
  const resources = load<any>("resources");
  const industries = load<any>("industries");
  const subIndustries = load<any>("subIndustries");

  // Independent/leaf records first, in an order that satisfies foreign keys.
  for (const row of partners) {
    await prisma.partner.upsert({ where: { id: row.id }, update: row, create: row });
  }
  for (const row of customerStories) {
    await prisma.customerStory.upsert({ where: { id: row.id }, update: row, create: row });
  }
  for (const row of resources) {
    await prisma.resource.upsert({ where: { id: row.id }, update: row, create: row });
  }
  for (const row of industries) {
    await prisma.industry.upsert({ where: { id: row.id }, update: row, create: row });
  }
  for (const row of subIndustries) {
    await prisma.subIndustry.upsert({ where: { id: row.id }, update: row, create: row });
  }

  // Depend on the ids created above (storyIds/resourceIds/industry refs live inside these JSON blobs).
  for (const row of homeSections) {
    await prisma.homeSection.upsert({ where: { key: row.key }, update: row, create: row });
  }
  for (const row of homeSeo) {
    await prisma.homeSeo.upsert({ where: { id: row.id }, update: row, create: row });
  }
  for (const row of globalConfig) {
    await prisma.globalConfig.upsert({ where: { id: row.id }, update: row, create: row });
  }
  for (const row of adminConfig) {
    await prisma.adminConfig.upsert({ where: { id: row.id }, update: row, create: row });
  }

  console.log(
    `Seeded real content: ${industries.length} industries, ${subIndustries.length} sub-industries, ` +
      `${partners.length} partners, ${customerStories.length} customer stories, ${resources.length} resources, ` +
      `${homeSections.length} home sections.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
