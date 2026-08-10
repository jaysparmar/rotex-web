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
      title: "Partner with a Global Leader in Solenoid Valve & Fluid Control Solutions",
      description:
        "Join Rotex's international channel partner network and deliver high-performance, application-engineered solutions across Oil & Gas, Chemical, Power, Mining, and Industrial Automation sectors.",
      image: "/media/channel-partner-hero.jpg",
      cta: { label: "Become a Channel Partner", href: "#form" },
    },
  },
  {
    key: "stats",
    order: 2,
    data: {
      stats: [
        { value: "47%", label: "Growth in industrial valve revenue" },
        { value: "53+", label: "Partners with a relationship lasting over 10 years." },
        { value: "71,000+", label: "Catalogue items" },
        { value: "6,100+", label: "Customized solenoid valve solutions" },
        { value: "50+", label: "International certifications & approvals" },
        { value: "3", label: "Global offices across UAE, Netherlands, and Malaysia" },
      ],
      growthHeading: "Built for Growth",
      growthDescription: "Expand your reach, operate efficiently, and grow with confidence.",
    },
  },
  {
    key: "why",
    order: 3,
    data: {
      heading: "Why Global Distributors Choose Rotex",
      description:
        "Rotex is positioned as a technology-driven manufacturer, enabling channel partners to compete in technically demanding and compliance-heavy industries.",
      cards: [
        {
          title: "Proven Global Growth Engine",
          points: [
            "10,000+ qualified industrial leads generated",
            "Channel partners achieving 35% YoY growth",
            "Typical distributor margins: 17–20%",
            "ROI potential up to 57% with optimized inventory programs",
          ],
        },
        {
          title: "Engineering-Driven Product Portfolio",
          points: [
            "Solenoid valves: 2/2, 3/2, 5/2 configurations",
            "Explosion-proof, intrinsically safe, and NAMUR designs",
            "Electro-hydraulic actuators & positioners",
            "Designed for hazardous, high-pressure, and high-temperature applications",
          ],
        },
        {
          title: "Strong Technical Differentiation",
          points: [
            "Coil insulation: Class F (155°C) / Class H (180°C)",
            "Protection: IP65 / IP67",
            "Materials: Brass, SS304, SS316 (corrosion-resistant applications)",
            "Precision orifice control (~1 mm to 5 mm)",
          ],
        },
      ],
    },
  },
  {
    key: "benefits",
    order: 4,
    data: {
      heading: "What You Get as a Rotex Channel Partner",
      benefits: [
        { icon: "proven-solutions", text: "Access to a wide range of proven industrial solutions" },
        { icon: "expand-industries", text: "Opportunity to expand into multiple high-demand industries" },
        { icon: "scalable-model", text: "Strong margin potential with a scalable business model" },
        { icon: "reduced-risk", text: "Reduced financial risk through partner-first practices" },
        { icon: "support", text: "Consistent support for sales, technical, and operations" },
        { icon: "growth-chart", text: "Long-term partnership focused on mutual growth" },
      ],
    },
  },
  {
    key: "map",
    order: 5,
    data: {
      heading: "Global Channel Partner Network",
      description: "Rotex has established a strong international distribution ecosystem across key industrial markets:",
      callout: "A globally trusted network ensuring local expertise with international engineering standards.",
      countryIds: [],
    },
  },
  {
    key: "stories",
    order: 6,
    data: {
      heading: { title: "Channel Partner Stories", subtitle: "Hear from partners who grew with Rotex" },
      stories: [
        {
          id: "1",
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=640&q=80",
          quote:
            "Becoming a Rotex channel partner gave us access to a proven, technically differentiated product line — our margins and customer retention both improved within the first year.",
          author: "Ahmed Al-Farsi",
          company: "Managing Director, Gulf Flow Automation LLC",
        },
        {
          id: "2",
          image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=640&q=80",
          quote:
            "The support from Rotex's technical and sales teams made it easy to expand into new industrial segments we hadn't served before.",
          author: "Priya Nair",
          company: "CEO, Nair Industrial Solutions",
        },
        {
          id: "3",
          image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=640&q=80",
          quote:
            "Rotex's engineering-first approach to product design has made it far easier for us to win technically demanding tenders in the oil & gas sector.",
          author: "Marco Bianchi",
          company: "Founder, Bianchi Flow Systems Srl",
        },
        {
          id: "4",
          image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&q=80",
          quote:
            "From onboarding to ongoing technical training, Rotex treated us as a true growth partner, not just a supplier.",
          author: "Wei Zhang",
          company: "General Manager, Zhang Industrial Trading Co.",
        },
        {
          id: "5",
          image: "https://images.unsplash.com/photo-1580489944761-15a19d654944?w=640&q=80",
          quote:
            "The scalable margin structure and consistent inventory support helped us grow our solenoid valve business by over 40% in two years.",
          author: "Fatima Al-Sayed",
          company: "Sales Director, Al-Sayed Automation Group",
        },
      ],
    },
  },
  {
    key: "form",
    order: 7,
    data: {
      headingPrefix: "Expand Your Industrial Portfolio with a",
      headingHighlight: "Globally Trusted Manufacturer",
      description:
        "Partner with Rotex to deliver high-performance fluid control solutions backed by engineering excellence, global reach, and consistent demand generation.",
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
    await prisma.channelPartnerSection.upsert({
      where: { key: section.key },
      update: { order: section.order, data: section.data as never },
      create: { key: section.key, order: section.order, enabled: true, data: section.data as never },
    });
  }

  const heroImageUrl = "/media/channel-partner-hero.jpg";
  const existingHeroImage = await prisma.mediaAsset.findFirst({ where: { url: heroImageUrl } });
  if (!existingHeroImage) {
    await prisma.mediaAsset.create({
      data: {
        url: heroImageUrl,
        type: "image",
        filename: "channel-partner-hero.jpg",
        alt: "Rotex channel partners shaking hands",
      },
    });
  }

  console.log(`Seeded ${SECTIONS.length} channel-partner sections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
