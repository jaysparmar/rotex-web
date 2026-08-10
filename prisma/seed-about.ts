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
      breadcrumbLabel: "About Us",
      title: "Empowering Industries. Where It Matters Most.",
      description:
        "Engineered flow control solutions designed to perform where operational failure is not an option - across Oil & Gas, Chemical, Power, Pharma, Automotive, and global process industries.",
      cta: { label: "Talk to Expert", href: "/contact" },
    },
  },
  {
    key: "story",
    order: 2,
    data: {
      heading: "Our Story",
      paragraphs: [
        "In 1967, in the industrial city of Vadodara, India, a company was founded with a single obsession: build flow control components so precisely engineered that the process plants which depend on them never have to think about them again.",
        "That obsession did not change as Rotex grew. It deepened. Each decade brought new industries, new continents, and new applications: gas fields in Saudi Arabia, pharmaceutical cleanrooms in Europe, rocket test facilities in India, and commercial trucks crossing the Alps. The applications changed. The engineering standard never wavered.",
      ],
      stats: [
        { value: "10M+", label: "Field units operating" },
        { value: "58", label: "Years of engineering" },
        { value: "13", label: "Global certifications" },
        { value: "29+", label: "Patents protected" },
        { value: "81", label: "Countries served" },
        { value: "5", label: "Leading Oil & Gas operators served" },
      ],
      trustedLabel: "Trusted by Industry leaders",
      partnerIds: [],
      videoSrc: "/media/about-us.mp4",
    },
  },
  {
    key: "mission-vision",
    order: 3,
    data: {
      mission:
        "To deliver highly engineered fluid control solutions that make industry run safer, smarter and more efficiently, with an unwavering focus on technology, quality and performance.",
      vision:
        "Providing customers with fluid control automation solutions with utmost safety, efficiency and control to harness the power of fluids.",
    },
  },
  {
    key: "values",
    order: 4,
    data: {
      heading: "Built Beyond Standards",
      subheading: "The values behind our engineering, speed, and global trust.",
      values: [
        {
          title: "Engineer the root. Not the symptom.",
          description:
            "When a valve fails repeatedly, most manufacturers improve the replacement process. We investigate why it failed and eliminate the failure mode permanently. 73% of solenoid valve failures trace to one root cause — contamination from conventional spool designs. We replaced the spool.",
        },
        {
          title: "The specification is the floor, not the ceiling.",
          description:
            "Meeting the printed spec is the minimum bar, not the target. We engineer margin into every component so it keeps performing long after the datasheet numbers are tested.",
        },
        {
          title: "Every application is unique. Every solution should be.",
          description:
            "No two installations face identical pressure, temperature, or contamination profiles. We configure every solution around the operating conditions it will actually face — not a generic default.",
        },
        {
          title: "Speed without compromise is an engineering achievement, not a shortcut.",
          description: "We move fast without cutting corners on quality or safety.",
        },
        {
          title: "Global trust is earned one installation at a time.",
          description: "Every deployment, in every country, upholds the same engineering standard.",
        },
      ],
    },
  },
  {
    key: "journey",
    order: 5,
    data: {
      heading: "Our Journey",
      milestones: [
        { year: "1967", title: "Foundation of Rotex", description: "Rotex was established by Mr. Jitendra Shah for the manufacturing of textile machinery under the name Rotex – Rotating Textile Machinery." },
        { year: "1974", title: "International Technical Collaboration", description: "Rotex entered into a technical collaboration with the Swiss company Eugen Seitz for the manufacturing of solenoid valves." },
        { year: "1976", title: "Entry into Solenoid Valve Manufacturing", description: "Started manufacturing high-quality solenoid valves, marking the beginning of Rotex's journey in fluid automation." },
        { year: "1983", title: "Manufacturing Shift to Vadodara", description: "The manufacturing operations for solenoid valves were shifted to Vadodara, Gujarat." },
        { year: "1988", title: "Expansion with a New Manufacturing Unit", description: "To meet growing demand, Rotex established an additional manufacturing facility at Vitthal Udyognagar, Anand." },
        { year: "1991", title: "Mumbai Plant Restarted", description: "The Mumbai plant resumed operations with manufacturing focused on pneumatic actuators and cylinders." },
        { year: "2000", title: "ISO 9001 Certification Achieved", description: "Rotex became ISO 9001 certified, reinforcing its commitment to quality management systems." },
        { year: "2001", title: "ATEX Certification for Exd Solenoid Valves", description: "Received ATEX certification for flameproof (Exd) solenoid valves." },
        { year: "2006", title: "ATEX Certification for Exia Solenoid Valves", description: "Expanded hazardous area product offerings with ATEX certification for intrinsically safe (Exia) solenoid valves." },
        { year: "2007", title: "PED Certification", description: "Rotex's solenoid valve program received Pressure Equipment Directive (PED) certification." },
        { year: "2009", title: "Global Industry Approvals", description: "Obtained prestigious certifications and approvals including GOST and INMETRO." },
        { year: "2012", title: "SIL3 Certification", description: "Achieved SIL3 certification, strengthening Rotex's position in safety-critical automation applications." },
        { year: "2014", title: "Strategic Acquisition", description: "Acquired the German company Maxsev Valves GmbH, expanding Rotex's global footprint and technological capabilities." },
        { year: "2017", title: "International Safety & Quality Standards", description: "Obtained ISO 14001, ISO 45001, and KOSHA certifications." },
        { year: "2018", title: "Business Restructuring", description: "Divested the pneumatic actuator, cylinder, ball valve, and butterfly valve business divisions." },
        { year: "2022", title: "UL Certification for Exd Solenoid Valves", description: "Received UL certification for Exd solenoid valves, enhancing global market acceptance." },
        { year: "2023", title: "JAPANEx Certification", description: "Achieved JAPANEx certification, strengthening Rotex's presence in international hazardous-area markets." },
        { year: "2025", title: "Major Expansion & Certification Milestone", description: "Expanded operations with a 1.3 million sq. ft. land development and achieved the BS EN 161 Kitemark Certification." },
      ],
    },
  },
  {
    key: "trusted-countries",
    order: 6,
    data: {
      title: "Trusted across 81 countries.",
      description:
        "From North Sea offshore platforms to Qatar gas fields, German cleanrooms, and Indian cement plants, Rotex is specified where precision matters and failure is not allowed.",
      countryIds: [],
    },
  },
  {
    key: "zero-downtime-cta",
    order: 7,
    data: {
      title: "Ready to engineer Zero Downtime into your plant?",
      description:
        "The N2W Zero Downtime Consultation applies 58 years of field-validated engineering to your specific plant - and identifies the failure modes most likely to cause your next shutdown. 45 minutes. No sales content. Written analysis in 48 hours.",
      ctaPrimary: { label: "Book Free Consultation", href: "/contact" },
      ctaSecondary: { label: "Download N2W Framework", href: "/downloads" },
    },
  },
  {
    key: "grow-with-rotex",
    order: 8,
    data: {
      title: "Grow With Rotex",
      description:
        "Join our global distribution network and deliver precision-engineered flow control solutions trusted across critical industries.",
      image: "",
      cta: { label: "Become a Partner", href: "/join/channel-partner" },
    },
  },
  {
    key: "achievements",
    order: 9,
    data: {
      heading: "What We Achieved So Far",
      awardIds: [],
      cta: { label: "See More of Our Wins", href: "/about/awards" },
    },
  },
  {
    key: "gallery",
    order: 10,
    data: { mediaIds: [] },
  },
  {
    key: "resources",
    order: 11,
    data: {
      heading: { title: "Resources" },
      tabs: [
        { id: "case-studies", label: "Case Studies", cta: { label: "Read All Case Studies", href: "/case-studies" }, resourceIds: [] },
        { id: "news", label: "News & Updates", cta: { label: "View All News & Updates", href: "/news-updates" }, resourceIds: [] },
        { id: "blogs", label: "Blogs", cta: { label: "Read All Blogs", href: "/blogs" }, resourceIds: [] },
      ],
    },
  },
  {
    key: "awards",
    order: 12,
    data: {
      title: "Awards & Recognition",
      description:
        "Celebrating excellence and innovation in industrial automation. Our commitment to quality and technological advancement has earned recognition from leading organizations worldwide.",
    },
  },
];

async function main() {
  for (const section of SECTIONS) {
    await prisma.aboutSection.upsert({
      where: { key: section.key },
      update: { order: section.order, data: section.data as never },
      create: { key: section.key, order: section.order, enabled: true, data: section.data as never },
    });
  }

  console.log(`Seeded ${SECTIONS.length} about sections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
