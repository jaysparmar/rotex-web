import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const GLOBAL_CONFIG: PrismaJson.GlobalConfigData = {
  logo: { src: "/logo.svg", alt: "Rotex", href: "/" },
  header: {
    nav: [
      {
        id: "nav_001",
        label: "Products",
        href: "/products",
        enabled: true,
        // Mega menu intentionally off — product categories aren't client-approved yet.
        // Switch to "Product Categories (live data)" in admin once they are.
        megaMenu: null,
      },
      {
        id: "nav_002",
        label: "Industries",
        href: "/industries",
        enabled: true,
        megaMenu: {
          type: "flat",
          columns: [
            {
              groups: [
                {
                  heading: "Oil & Gas",
                  href: "/industries/oil-gas",
                  items: [
                    { label: "Upstream", href: "/industries/oil-gas/upstream" },
                    { label: "Midstream", href: "/industries/oil-gas/midstream" },
                    { label: "Downstream", href: "/industries/oil-gas/downstream" },
                  ],
                },
                {
                  heading: "Power",
                  href: "/industries/power",
                  items: [
                    { label: "Thermal Power", href: "/industries/power/thermal" },
                    { label: "Nuclear Power", href: "/industries/power/nuclear" },
                  ],
                },
              ],
            },
            {
              groups: [
                {
                  heading: "Process Industries",
                  href: "/industries/process",
                  items: [
                    { label: "Fertilizer", href: "/industries/process/fertilizer" },
                    { label: "Chemicals", href: "/industries/process/chemicals" },
                    { label: "Cement", href: "/industries/process/cement" },
                    { label: "Food & Beverages", href: "/industries/process/food-beverages" },
                    { label: "Paper & Pulp", href: "/industries/process/paper-pulp" },
                    { label: "Pharmaceuticals", href: "/industries/process/pharmaceuticals" },
                    { label: "Paints", href: "/industries/process/paints" },
                    { label: "Textiles", href: "/industries/process/textiles" },
                    { label: "Water Management", href: "/industries/process/water-management" },
                    { label: "Metal & Mining", href: "/industries/process/metal-mining" },
                    { label: "Tyre", href: "/industries/process/tyre" },
                  ],
                },
              ],
            },
            {
              groups: [
                {
                  heading: "Machine Solutions",
                  href: "/industries/machine-solutions",
                  items: [{ label: "Fire Fighting System", href: "/industries/machine-solutions/fire-fighting" }],
                },
                { heading: "Automotive", href: "/industries/automotive" },
                { heading: "Rail", href: "/industries/rail" },
                { heading: "Aerospace & Defence", href: "/industries/aerospace-defence" },
              ],
            },
          ],
          image: "/mega-menu/industries.png",
        },
      },
      {
        id: "nav_003",
        label: "About Us",
        href: "/about",
        enabled: true,
        megaMenu: {
          type: "flat",
          columns: [
            { groups: [{ heading: "Who we are", href: "/about", description: "Our mission and Story" }] },
            { groups: [{ heading: "Awards", href: "/about/awards", description: "Milestones of Excellence and Trust" }] },
          ],
          image: "/mega-menu/about.png",
        },
      },
      { id: "nav_004", label: "Downloads", href: "/downloads", enabled: true, megaMenu: null },
      {
        id: "nav_005",
        label: "Stay Informed",
        href: "/news-updates",
        enabled: true,
        megaMenu: {
          type: "flat",
          columns: [
            { groups: [{ heading: "Blogs", href: "/blogs", description: "Expert insights for modern industries" }] },
            { groups: [{ heading: "News & Updates", href: "/news-updates", description: "Update with Latest Trends & Technology" }] },
            { groups: [{ heading: "Case Studies", href: "/case-studies", description: "Update with Latest Trends & Technology" }] },
          ],
          image: "/mega-menu/stay-informed.png",
          imageCaption: "ISRO's Mahendragiri Facility",
        },
      },
      {
        id: "nav_006",
        label: "Join Us",
        href: "/join",
        enabled: true,
        megaMenu: {
          type: "flat",
          columns: [
            { className: "w-52", groups: [{ heading: "Become a Channel Partner", href: "/join/channel-partner", description: "Collaborate to drive shared industrial growth" }] },
            { className: "w-52", groups: [{ heading: "Become a Supplier", href: "/join/supplier", description: "Supply certified components for reliable operations" }] },
            { className: "w-32", groups: [{ heading: "Career", href: "/join/career", description: "Be a Part of Our Growth" }] },
            { className: "w-44", groups: [{ heading: "Partner Sales Tools", href: "/join/partner-sales-tools", description: "Partner-Ready Sales Resources" }] },
          ],
          cta: { text: "Submit your details to Become a Channel Partner", href: "/join/channel-partner" },
        },
      },
    ],
    cta: { label: "Contact Us", href: "/contact" },
  },
  footer: {
    tagline: "Engineering For the Future",
    columns: [
      {
        id: "col_001",
        heading: "Products",
        enabled: true,
        source: null,
        links: [
          { label: "Solenoid Valves", href: "/products/solenoid-valve" },
          { label: "Angle Seat Valves", href: "/products/angle-seat-valve" },
          { label: "Automotive solutions", href: "/products/automotive-solutions" },
          { label: "Actuators", href: "/products/actuators" },
          { label: "Positioners", href: "/products/positioners" },
        ],
      },
      {
        id: "col_002",
        heading: "Industries",
        enabled: true,
        // Resolved live from the Industry table (main industries only) — see main() below.
        source: { type: "industries", selectedIds: [] as string[] },
        links: [],
      },
      {
        id: "col_003",
        heading: "Company",
        enabled: true,
        source: null,
        links: [
          { label: "Who we are", href: "/about" },
          { label: "Awards", href: "/about/awards" },
        ],
      },
      {
        id: "col_004",
        heading: "Join Us",
        enabled: true,
        source: null,
        links: [
          { label: "Become a Distributor", href: "/join/channel-partner" },
          { label: "Become a Supplier", href: "/join/supplier" },
          { label: "Career", href: "/join/career" },
        ],
      },
      {
        id: "col_005",
        heading: "Resources",
        enabled: true,
        source: null,
        links: [{ label: "Downloads", href: "/downloads" }],
      },
      {
        id: "col_006",
        heading: "Stay Informed",
        enabled: true,
        source: null,
        links: [
          { label: "Blogs", href: "/blogs" },
          { label: "News & Updates", href: "/news-updates" },
          { label: "Case Studies", href: "/case-studies" },
        ],
      },
    ],
    social: [
      { id: "soc_001", platform: "linkedin", href: "https://linkedin.com/company/rotex" },
      { id: "soc_002", platform: "instagram", href: "https://instagram.com/rotex" },
      { id: "soc_003", platform: "facebook", href: "https://facebook.com/rotex" },
    ],
    legal: {
      copyright: "© 2026 Rotex. All rights reserved.",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
      ],
    },
    contact: {
      email: "info@rotex.com",
      phone: "+91 22 0000 0000",
      address: "Rotex Industries, Mumbai, India",
    },
  },
};

const PARTNERS: { id: string; name: string; logo: string }[] = [
  { id: "partner_001", name: "Scania", logo: "/uploads/partners/scania.png" },
  { id: "partner_002", name: "Cummins", logo: "/uploads/partners/cummins.png" },
  { id: "partner_003", name: "Reliance", logo: "/uploads/partners/reliance.png" },
  { id: "partner_004", name: "Qatar Petroleum", logo: "/uploads/partners/qatar-petroleum.png" },
  { id: "partner_005", name: "Petronas", logo: "/uploads/partners/petronas.png" },
  { id: "partner_006", name: "Shell", logo: "/uploads/partners/shell.png" },
  { id: "partner_007", name: "Aurobindo", logo: "/uploads/partners/aurobindo.png" },
  { id: "partner_008", name: "Aramco", logo: "/uploads/partners/aramco.png" },
  { id: "partner_009", name: "Bharat Petroleum", logo: "/uploads/partners/bharat-petroleum.png" },
  { id: "partner_010", name: "Linde", logo: "/uploads/partners/linde.png" },
  { id: "partner_011", name: "NPCIL", logo: "/uploads/partners/npcil.png" },
  { id: "partner_012", name: "Adnoc", logo: "/uploads/partners/adnoc.png" },
  { id: "partner_013", name: "Isro", logo: "/uploads/partners/isro.png" },
  { id: "partner_014", name: "Air Liquide", logo: "/uploads/partners/air-liquide.png" },
  { id: "partner_015", name: "Dr. Reddy's", logo: "/uploads/partners/dr-reddy.png" },
  { id: "partner_016", name: "GE", logo: "/uploads/partners/ge.png" },
  { id: "partner_017", name: "Daimler", logo: "/uploads/partners/daimler.png" },
  { id: "partner_018", name: "NIGC", logo: "/uploads/partners/nigc.png" },
];

const RESOURCES: { type: string; slug: string; title: string; image: string }[] = [
  { type: "case-studies", slug: "solenoid-valve-classification", title: "Solenoid Valve Classification: The Engineering Logic Behind Reliable Automation Systems", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
  { type: "case-studies", slug: "future-industrial-valves", title: "Future of Industrial Valves: 7 Rotex Technologies Improving Reliability & Uptime", image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=600&q=80" },
  { type: "case-studies", slug: "select-solenoid-valve", title: "How to Select the Right Solenoid Valve for Your Industrial Process?", image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80" },
  { type: "news", slug: "global-expansion", title: "Rotex Expands Global Distribution Network Across 15 New Markets", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80" },
  { type: "news", slug: "smart-valve-controllers", title: "Rotex Launches Next-Generation Smart Valve Controllers for Industry 4.0", image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&q=80" },
  { type: "news", slug: "sil3-certification", title: "Rotex Achieves SIL 3 Certification for Critical Safety Systems", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80" },
  { type: "blogs", slug: "valve-maintenance-signs", title: "5 Signs Your Industrial Valve Needs Immediate Maintenance", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80" },
  { type: "blogs", slug: "valve-actuators-guide", title: "Understanding Valve Actuators: A Comprehensive Guide for Engineers", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80" },
  { type: "blogs", slug: "flow-control-oil-gas", title: "Flow Control in the Oil & Gas Industry: Challenges and Solutions", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80" },
];

const HOME_SEO = {
  title: "Rotex | Flow Control. Where It Matters Most.",
  description:
    "Engineered flow control solutions that reduce downtime, enhance safety, and ensure uninterrupted operations across critical industries.",
  og_image: { src: "https://cdn.rotex.com/og/home.jpg", alt: "Rotex — Flow Control Solutions" },
  canonical: "https://www.rotex.com",
};

const SECTIONS: { key: string; order: number; data: unknown }[] = [
  {
    key: "hero",
    order: 1,
    data: {
      slides: [
        {
          id: "slide_001",
          published: true,
          title: "Flow Control. Where It Matters Most.",
          description:
            "Engineered precise solutions that reduce downtime, enhance safety, and ensure uninterrupted operations across critical industry applications.",
          media: { type: "video", src: "https://cdn.rotex.com/hero/slide-1.mp4" },
          cta_buttons: [
            { label: "Explore Solutions", href: "/solutions" },
            { label: "Download Zero Downtime Blueprint", href: "/downloads" },
          ],
        },
        {
          id: "slide_002",
          published: true,
          title: "Precision Engineered For Critical Industries.",
          description:
            "Over four decades of expertise delivering valve solutions trusted by the world's most demanding sectors.",
          media: {
            type: "image",
            src: "https://cdn.rotex.com/hero/slide-2.jpg",
            alt: "Rotex valve installation in oil refinery",
          },
          cta_buttons: [
            { label: "View Products", href: "/products" },
            { label: "Contact Us", href: "/contact" },
          ],
        },
      ],
    },
  },
  {
    key: "partners",
    order: 2,
    data: {
      title: "Trusted by Industry Leaders",
      partnerIds: PARTNERS.map((p) => p.id),
    },
  },
  {
    key: "redefining",
    order: 3,
    data: {
      heading: {
        title: "Redefining Flow Performance",
        subtitle:
          "A new chapter shaped by precision engineering, advanced capabilities, and a commitment to solving the most demanding industrial challenges.",
      },
      media: { type: "video", src: "https://cdn.rotex.com/redefining/overview.mp4" },
      tagline: { prefix: "Leading Flow", highlight: "Intelligence", suffix: "Since 1967" },
      stats: [
        { id: "stat_001", value: 33, suffix: "", label: "Utility Patents", format_comma: false, published: true },
        { id: "stat_002", value: 83, suffix: "+", label: "Countries Served Worldwide", format_comma: false, published: true },
        { id: "stat_003", value: 21, suffix: "+", label: "International Certifications", format_comma: false, published: true },
        { id: "stat_004", value: 80, suffix: "+", label: "Global Distributors", format_comma: false, published: true },
        { id: "stat_005", value: 9000, suffix: "+", label: "Customers", format_comma: true, published: true },
        { id: "stat_006", value: 6000, suffix: "+", label: "Customised Solutions Developed", format_comma: true, published: true },
      ],
    },
  },
  {
    key: "industries",
    order: 4,
    data: {
      heading: {
        title: "Built Around Your Industry",
        subtitle:
          "Tailored solutions designed to meet the operational demands of your sector — ensuring precision, reliability, and long-term performance.",
      },
      industries: [
        { id: "ind_001", published: true, slug: "oil-gas", label: "Oil and Gas", title: "OIL AND GAS", description: "The Hidden Reason 73% of Oil & Gas Plants Shutdowns Are Actually Preventable (And Why Most Plants Still Don't Know This)", image: { src: "https://cdn.rotex.com/industries/oil-gas.jpg", alt: "Oil and gas refinery" } },
        { id: "ind_002", published: true, slug: "process", label: "Process", title: "PROCESS", description: "Precision flow control solutions built for continuous process environments where uptime is non-negotiable.", image: { src: "https://cdn.rotex.com/industries/process.jpg", alt: "Industrial process plant" } },
        { id: "ind_003", published: true, slug: "power", label: "Power", title: "POWER", description: "Engineered screening and conveying systems that keep power generation facilities running at peak efficiency.", image: { src: "https://cdn.rotex.com/industries/power.jpg", alt: "Power generation facility" } },
        { id: "ind_004", published: true, slug: "rail", label: "Rail", title: "RAIL", description: "Heavy-duty material handling solutions designed for the demanding conditions of rail infrastructure.", image: { src: "https://cdn.rotex.com/industries/rail.jpg", alt: "Rail infrastructure" } },
        { id: "ind_005", published: true, slug: "machine-solution", label: "Machine Solution", title: "MACHINE SOLUTION", description: "Custom-engineered flow and separation systems integrated seamlessly into your existing machine architecture.", image: { src: "https://cdn.rotex.com/industries/machine-solution.jpg", alt: "Industrial machinery" } },
        { id: "ind_006", published: true, slug: "aerospace", label: "Aerospace & Defence", title: "AEROSPACE & DEFENCE", description: "Certified separation and screening equipment meeting the rigorous standards of aerospace and defence supply chains.", image: { src: "https://cdn.rotex.com/industries/aerospace.jpg", alt: "Aerospace manufacturing" } },
        { id: "ind_007", published: true, slug: "automotive", label: "Automotive", title: "AUTOMOTIVE", description: "High-throughput material handling systems built for the speed and precision demands of automotive production.", image: { src: "https://cdn.rotex.com/industries/automotive.jpg", alt: "Automotive production line" } },
      ],
    },
  },
  {
    key: "products",
    order: 5,
    data: {
      heading: { title: "Engineered Flow Control Systems" },
      cta: { label: "View All Products", href: "/products" },
      products: [
        { id: "prod_001", published: true, slug: "solenoid-valve", name: "Solenoid Valve", description: "The Component Inside Valves That Cannot Fail", image: { src: "https://cdn.rotex.com/products/solenoid-valve.png", alt: "Solenoid Valve" } },
        { id: "prod_002", published: true, slug: "angle-seat-valve", name: "Angle Seat Valve", description: "Durable flow control for demanding needs", image: { src: "https://cdn.rotex.com/products/angle-seat-valve.png", alt: "Angle Seat Valve" } },
        { id: "prod_003", published: true, slug: "actuators", name: "Actuators", description: "Powerful mechanical devices for valve movement", image: { src: "https://cdn.rotex.com/products/actuators.png", alt: "Actuators" } },
        { id: "prod_004", published: true, slug: "positioners", name: "Positioners", description: "Precise, digital control for valve positioning", image: { src: "https://cdn.rotex.com/products/positioners.png", alt: "Positioners" } },
        { id: "prod_005", published: true, slug: "controllers", name: "Controllers", description: "Smart process control for industrial systems", image: { src: "https://cdn.rotex.com/products/controllers.png", alt: "Controllers" } },
        { id: "prod_006", published: true, slug: "sensors", name: "Sensors", description: "Accurate measurement for critical processes", image: { src: "https://cdn.rotex.com/products/sensors.png", alt: "Sensors" } },
        { id: "prod_007", published: true, slug: "automation", name: "Automation Systems", description: "End-to-end automation for flow operations", image: { src: "https://cdn.rotex.com/products/automation.png", alt: "Automation Systems" } },
      ],
    },
  },
  {
    key: "certifications",
    order: 6,
    data: {
      title: "Certified & Trusted Worldwide",
      description: "Recognised and certified by leading global standards bodies and industry partners.",
      partnerIds: PARTNERS.map((p) => p.id),
    },
  },
  {
    key: "customer-stories",
    order: 7,
    data: {
      heading: { title: "Customer Stories", subtitle: "Trusted across industries, proven in action" },
      storyIds: [] as string[],
    },
  },
  {
    key: "resources",
    order: 8,
    data: {
      heading: { title: "Resources" },
      tabs: [
        { id: "case-studies", label: "Case Studies", cta: { label: "Read All Case Studies", href: "/case-studies" }, resourceIds: [] as string[] },
        { id: "news", label: "News & Updates", cta: { label: "View All News", href: "/news-updates" }, resourceIds: [] as string[] },
        { id: "blogs", label: "Blogs", cta: { label: "Read All Blogs", href: "/blogs" }, resourceIds: [] as string[] },
      ],
    },
  },
  {
    key: "cta",
    order: 9,
    data: {
      background_image: { src: "https://cdn.rotex.com/cta/cta-bg.jpg", alt: "CTA background" },
      title: "Let's Solve Your Next Challenge",
      subtitle: "Connect with our experts to find the right solution for your application.",
      cta: { label: "Book Free Consultation", href: "/contact" },
    },
  },
];

async function main() {
  await prisma.globalConfig.upsert({
    where: { id: "global" },
    update: { data: GLOBAL_CONFIG },
    create: { id: "global", data: GLOBAL_CONFIG },
  });

  await prisma.homeSeo.upsert({
    where: { id: "home" },
    update: { data: HOME_SEO },
    create: { id: "home", data: HOME_SEO },
  });

  for (const partner of PARTNERS) {
    await prisma.partner.upsert({
      where: { id: partner.id },
      update: { name: partner.name, logo: partner.logo },
      create: { id: partner.id, name: partner.name, logo: partner.logo, published: true },
    });
  }

  for (const section of SECTIONS) {
    await prisma.homeSection.upsert({
      where: { key: section.key },
      update: { order: section.order, data: section.data as never },
      create: { key: section.key, order: section.order, enabled: true, data: section.data as never },
    });
  }

  for (const resource of RESOURCES) {
    await prisma.resource.upsert({
      where: { type_slug: { type: resource.type, slug: resource.slug } },
      update: { title: resource.title, image: resource.image },
      create: { ...resource, published: true },
    });
  }

  // Default the home page's resources picker's tabs to the resources seeded above,
  // so each tab isn't empty out of the box (admin can still adjust the selection).
  const seededResources = await prisma.resource.findMany({
    where: { type: { in: RESOURCES.map((r) => r.type) } },
    select: { id: true, type: true },
  });
  const resourcesSection = await prisma.homeSection.findUnique({ where: { key: "resources" } });
  const resourcesData = resourcesSection?.data as
    | { heading: unknown; tabs: { id: string; label: string; cta: unknown; resourceIds?: string[] }[] }
    | undefined;
  if (resourcesData) {
    const tabs = resourcesData.tabs.map((tab) => ({
      ...tab,
      resourceIds: seededResources.filter((r) => r.type === tab.id).map((r) => r.id),
    }));
    await prisma.homeSection.update({
      where: { key: "resources" },
      data: { data: { ...resourcesData, tabs } as never },
    });
  }

  // Default the home page's customer-stories picker to a handful of existing stories,
  // so the section isn't empty out of the box (admin can still adjust the selection).
  const existingStories = await prisma.customerStory.findMany({
    where: { published: true },
    select: { id: true },
    take: 12,
  });
  if (existingStories.length > 0) {
    const current = await prisma.homeSection.findUnique({ where: { key: "customer-stories" } });
    const currentData = current?.data as { heading: unknown; storyIds?: string[] } | undefined;
    if (currentData) {
      await prisma.homeSection.update({
        where: { key: "customer-stories" },
        data: { data: { ...currentData, storyIds: existingStories.map((s) => s.id) } as never },
      });
    }
  }

  // Default the footer's "Industries" column to every existing industry.
  const existingIndustries = await prisma.industry.findMany({ select: { id: true } });
  if (existingIndustries.length > 0) {
    const globalRecord = await prisma.globalConfig.findUnique({ where: { id: "global" } });
    const globalData = globalRecord?.data as PrismaJson.GlobalConfigData | undefined;
    if (globalData) {
      const columns = globalData.footer.columns.map((col) =>
        col.id === "col_002"
          ? { ...col, source: { type: "industries" as const, selectedIds: existingIndustries.map((i) => i.id) } }
          : col
      );
      await prisma.globalConfig.update({
        where: { id: "global" },
        data: { data: { ...globalData, footer: { ...globalData.footer, columns } } as never },
      });
    }
  }

  console.log(`Seeded global config, home SEO, ${PARTNERS.length} partners, and ${SECTIONS.length} home sections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
