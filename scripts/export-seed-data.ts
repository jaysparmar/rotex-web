// Dumps live content from prisma/dev.db into prisma/seed-data/*.json.
// Run this whenever the client adds/edits content via the admin panel and
// you want that content locked into the repo as seed data.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const OUT_DIR = path.join(__dirname, "..", "prisma", "seed-data");

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const [
    globalConfig,
    adminConfig,
    homeSeo,
    homeSections,
    partners,
    customerStories,
    resources,
    industries,
    subIndustries,
  ] = await Promise.all([
    prisma.globalConfig.findMany(),
    prisma.adminConfig.findMany(),
    prisma.homeSeo.findMany(),
    prisma.homeSection.findMany(),
    prisma.partner.findMany(),
    prisma.customerStory.findMany(),
    prisma.resource.findMany(),
    prisma.industry.findMany(),
    prisma.subIndustry.findMany(),
  ]);

  const dump: Record<string, unknown> = {
    globalConfig,
    adminConfig,
    homeSeo,
    homeSections,
    partners,
    customerStories,
    resources,
    industries,
    subIndustries,
  };

  for (const [name, data] of Object.entries(dump)) {
    fs.writeFileSync(path.join(OUT_DIR, `${name}.json`), JSON.stringify(data, null, 2) + "\n");
    console.log(`Wrote ${name}.json (${Array.isArray(data) ? data.length : 1} record(s))`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
