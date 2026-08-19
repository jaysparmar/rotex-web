// Starter data for the Company -> Category -> Sub-Category admin section.
// Company names aren't finalized yet, so these are clearly-placeholder
// companies — rename/replace them at /admin/companies once decided. The
// category names reuse the taxonomy also used as Product Family options
// (see PRODUCT_FAMILIES in src/lib/product-constants.ts) so they're
// immediately useful once products are linked to categories.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const CATEGORY_NAMES = ["Solenoid Valve", "Actuators", "Angle Seat Valve"];

const COMPANIES: { slug: string; name: string }[] = [
  { slug: "company-a", name: "Company A (placeholder — rename me)" },
  { slug: "company-b", name: "Company B (placeholder — rename me)" },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  let categoryCount = 0;

  for (const companyInput of COMPANIES) {
    const company = await prisma.company.upsert({
      where: { slug: companyInput.slug },
      update: { name: companyInput.name },
      create: companyInput,
    });

    for (const [index, categoryName] of CATEGORY_NAMES.entries()) {
      await prisma.category.upsert({
        where: { companyId_slug: { companyId: company.id, slug: slugify(categoryName) } },
        update: { name: categoryName, order: index },
        create: {
          name: categoryName,
          slug: slugify(categoryName),
          order: index,
          companyId: company.id,
        },
      });
      categoryCount += 1;
    }
  }

  console.log(`Seeded ${COMPANIES.length} companies with ${categoryCount} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
