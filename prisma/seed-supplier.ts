import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const SECTIONS: { key: string; order: number; data: unknown }[] = [
  {
    key: "hero",
    order: 1,
    data: {
      title: "Become a Supplier",
      description: "Expand your reach by supplying high-demand industrial components to a global distribution network.",
      image: "",
      cta: { label: "Apply as a Supplier", href: "#form" },
    },
  },
  {
    key: "benefits",
    order: 2,
    data: {
      heading: "Become a Supplier",
      description: "Join our supply chain and grow with a partner focused on quality, long-term relationships, and continuous capability development.",
      stats: [
        { value: "90%", label: "Components Supported" },
        { value: "98%", label: "ISO Certified Suppliers" },
        { value: "10-30%", label: "Business Growth" },
        { value: "95%", label: "IATF Certified (Automotive)" },
      ],
      benefits: [
        "Long-term partnerships built on trust and consistency",
        "Strong focus on supplier growth in capability and capacity",
        "Continuous support to improve process, efficiency, and quality",
        "Dedicated supplier development team for ongoing improvement",
        "Fair and transparent working relationships",
        "Opportunity to scale with a growing industrial network",
      ],
      cta: { label: "Apply as a Supplier", href: "#form" },
    },
  },
  {
    key: "form",
    order: 3,
    data: {
      headingPrefix: "Grow Your Business as a",
      headingHighlight: "Supplier",
      description: "If you are looking to enrich your product offering portfolio. Apply for becoming our prestigious league of channel partners with us.",
      countryOptions: ["United States", "India", "UAE", "Saudi Arabia", "United Kingdom", "Germany"],
      cityOptions: ["Mumbai", "Delhi", "Dubai", "London", "Berlin", "New York"],
      businessTypeOptions: ["Distributor", "Supplier", "System Integrator", "OEM Partner"],
      industryOptions: ["Oil & Gas", "Chemical", "Power", "Mining", "Industrial Automation"],
      defaultCountry: "United States",
    },
  },
];

async function main() {
  for (const section of SECTIONS) {
    await prisma.supplierSection.upsert({
      where: { key: section.key },
      update: { order: section.order, data: section.data as never },
      create: { key: section.key, order: section.order, enabled: true, data: section.data as never },
    });
  }

  console.log(`Seeded ${SECTIONS.length} supplier sections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
