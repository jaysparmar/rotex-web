import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const TOOL_URL = "https://rotex.ezzystack.com/";

const SECTIONS: { key: string; order: number; data: unknown }[] = [
  {
    key: "hero",
    order: 1,
    data: {
      title: "Rotex Automation Sales tools",
      description: "Access all your essential sales and customer service tools in one place.",
    },
  },
  {
    key: "tools",
    order: 2,
    data: {
      tools: [
        { icon: "/icons/values/product-configurator.svg", title: "Rotex Product Configurator", description: "Configure and customize Rotex products to meet your specifications.", link: TOOL_URL },
        { icon: "/icons/values/datasheet-creator.svg", title: "Data Sheet Creator", description: "Generate professional data sheets for your products.", link: TOOL_URL },
        { icon: "/icons/values/9x-code-finder.svg", title: "9X Code Finder", description: "Search and find 9X codes quickly and efficiently.", link: TOOL_URL },
        { icon: "/icons/values/9x-code-request-form.svg", title: "9x Code Request Form", description: "Request new 9X codes for your requirements.", link: TOOL_URL },
        { icon: "/icons/values/customer-complaint-form.svg", title: "Customer Complaint Form", description: "Submit customer complaints and feedback.", link: TOOL_URL },
        { icon: "/icons/values/price-request-form.svg", title: "Price Request Form", description: "Request pricing information for products and services.", link: TOOL_URL },
        { icon: "/icons/values/customer-dashboard.svg", title: "Customer Dashboard", description: "Access your customer dashboard and analytics.", link: TOOL_URL },
        { icon: "/icons/values/competitor-equivalent-model.svg", title: "Competitor Equivalent Model", description: "Find competitor equivalent models for your reference products.", link: TOOL_URL },
        { icon: "/icons/values/gad-request-form.svg", title: "GAD Request Form", description: "Submit GAD (Generate All Data) requests.", link: TOOL_URL },
        { icon: "/icons/values/string-validator.svg", title: "String Validator", description: "Validate and verify string formats for product codes.", link: TOOL_URL },
      ],
    },
  },
];

async function main() {
  for (const section of SECTIONS) {
    await prisma.partnerToolsSection.upsert({
      where: { key: section.key },
      update: { order: section.order, data: section.data as never },
      create: { key: section.key, order: section.order, enabled: true, data: section.data as never },
    });
  }
  console.log(`Seeded ${SECTIONS.length} partner tools sections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
