// Seeds the 6 top-level categories shown on the home page swiper, using the
// images already checked into public/categories/cat_1.png..cat_6.png.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { slug: "solenoid-valve", name: "Solenoid Valve", tagline: "The Component Inside Valves That Cannot Fail", image: "/categories/cat_1.png", order: 0 },
  { slug: "angle-seat-valve", name: "Angle Seat Valve", tagline: "Durable flow control for demanding needs", image: "/categories/cat_2.png", order: 1 },
  { slug: "actuators", name: "Actuators", tagline: "Powerful mechanical devices for valve movement", image: "/categories/cat_3.png", order: 2 },
  { slug: "positioners", name: "Positioners", tagline: "Precise, digital control for valve positioning", image: "/categories/cat_4.png", order: 3 },
  { slug: "automotive-solutions", name: "Automotive Solutions", tagline: "Custom control solutions for heavy vehicles.", image: "/categories/cat_5.png", order: 4 },
  { slug: "ctis", name: "CTIS", tagline: "Real-time, automated tyre pressure management", image: "/categories/cat_6.png", order: 5 },
];

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
