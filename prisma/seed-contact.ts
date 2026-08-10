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
      breadcrumbLabel: "Contact",
      title: "Let's Connect",
      description: "From product selection to technical guidance, we help you make the right decisions for your application.",
      ctaLabel: "Contact Us",
    },
  },
  {
    key: "offices",
    order: 2,
    data: {
      heading: "Connect with Rotex",
      description: "Locate offices, manufacturing facilities, or the right team for your specific requirement.",
      tabs: [
        {
          id: "sales",
          label: "Sales Office",
          offices: [
            {
              id: "sales-hq",
              name: "Rotex Group Sales Headquarters",
              address: "703, Western Edge II, Off. Western Express Highway, Borivali (East), Mumbai – 400 066, Maharashtra, India.",
              phone: "+91 22 4211 1444",
              email: "enq@rotexautomation.com",
            },
            {
              id: "sales-delhi",
              name: "Rotex North India Sales Office",
              address: "Plot 14, Sector 6, IMT Manesar, Gurugram – 122051, Haryana, India.",
              phone: "+91 124 456 7890",
              email: "sales.north@rotexautomation.com",
            },
          ],
        },
        {
          id: "manufacturing",
          label: "Manufacturing Units",
          offices: [
            {
              id: "mfg-plant1",
              name: "Rotex Manufacturing Plant I",
              address: "Plot No. 12/2, Village Kachigam, Nani Daman, Daman – 396210, India.",
              phone: "+91 260 225 5000",
              email: "manufacturing@rotexautomation.com",
            },
          ],
        },
        {
          id: "product-enquiry",
          label: "Product Enquiry Contacts",
          offices: [
            {
              id: "pe-valves",
              name: "Solenoid & Control Valves Desk",
              address: "703, Western Edge II, Off. Western Express Highway, Borivali (East), Mumbai – 400 066, Maharashtra, India.",
              phone: "+91 22 4211 1455",
              email: "valves@rotexautomation.com",
            },
          ],
        },
        {
          id: "global",
          label: "Global Offices",
          offices: [
            {
              id: "global-uae",
              name: "Rotex Automation FZE",
              address: "Jebel Ali Free Zone, Dubai, United Arab Emirates.",
              phone: "+971 4 881 5599",
              email: "uae@rotexautomation.com",
            },
            {
              id: "global-us",
              name: "Rotex Automation Inc.",
              address: "1200 Corporate Drive, Suite 200, Houston, TX 77043, USA.",
              phone: "+1 713 555 0142",
              email: "usa@rotexautomation.com",
            },
          ],
        },
      ],
    },
  },
  {
    key: "form",
    order: 3,
    data: {
      eyebrow: "About Rotex",
      heading: "A Global Fluid Control Specialist",
      description:
        "With a presence across 30+ countries, we partner with leading OEMs, EPCs, and system integrators to deliver cutting-edge automation solutions. Our expertise spans control valves, actuators, and complete automation systems designed for mission-critical applications.",
      certificationsLabel: "Standards & Certifications",
      certificationsText: "ATEX, IECEx, PESO, CE, SIL 2 / SIL 3, PED, ISI / BIS, INMETRO, UL",
      trustLabel: "Trusted by industry leaders",
      partnerIds: [],
      enquiryTypeOptions: [
        "General Enquiry",
        "Request a Quote",
        "Technical Support",
        "Become a Channel Partner",
        "Become a Supplier",
        "Careers",
      ],
      productTypeOptions: [
        "Solenoid Valves",
        "Control Valves",
        "Actuators",
        "Pneumatic Valves",
        "Process Automation Systems",
        "Other",
      ],
      countryOptions: ["United States", "India", "UAE", "Saudi Arabia", "United Kingdom", "Germany"],
      cityOptions: ["Mumbai", "Delhi", "Dubai", "London", "Berlin", "New York"],
      defaultCountry: "United States",
    },
  },
];

async function main() {
  for (const section of SECTIONS) {
    await prisma.contactSection.upsert({
      where: { key: section.key },
      update: { order: section.order, data: section.data as never },
      create: { key: section.key, order: section.order, enabled: true, data: section.data as never },
    });
  }

  console.log(`Seeded ${SECTIONS.length} contact sections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
