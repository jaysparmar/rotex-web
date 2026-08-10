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
      title: "Build Your Future With Us",
      description: "Take the next step in your career and work on meaningful projects that drive real impact across industries.",
      cta: { label: "See Open Roles", href: "#form" },
    },
  },
  {
    key: "values",
    order: 2,
    data: {
      heading: "Life at Rotex",
      description: "A culture built on learning, collaboration, and continuous improvement, where people grow while creating meaningful impact.",
      values: [
        { icon: "/icons/values/trending-up.svg", title: "Where Growth Comes Together", description: "Personal ambitions and career goals align to create meaningful and long-term professional growth." },
        { icon: "/icons/values/lightbulb.svg", title: "Driven by Innovation", description: "We foster an environment that encourages new ideas, creative thinking, and continuous improvement." },
        { icon: "/icons/values/rotate-ccw.svg", title: "Learning Through Experience", description: "Mistakes are treated as opportunities to learn, improve, and grow stronger with every challenge." },
        { icon: "/icons/values/badge-check.svg", title: "Values-Led Culture", description: "A system-driven approach guided by integrity, respect, and care in everything we do." },
        { icon: "/icons/values/users.svg", title: "Built on Teamwork & Customer Focus", description: "Collaboration and a strong customer-first mindset shape how we work and deliver value." },
        { icon: "/icons/values/target.svg", title: "Growth Through Challenges", description: "We encourage curiosity, learning, and the drive to take on challenges that push boundaries." },
      ],
    },
  },
  {
    key: "gallery",
    order: 3,
    data: {
      images: [
        { src: "/media/career/gallery/1.png", alt: "Rotex team at the manufacturing facility", size: "wide" },
        { src: "/media/career/gallery/2.png", alt: "Precision machining on the factory floor", size: "narrow" },
        { src: "/media/career/gallery/3.png", alt: "Rotex team at the manufacturing facility", size: "wide" },
        { src: "/media/career/gallery/4.png", alt: "Valve testing on the shop floor", size: "narrow" },
      ],
    },
  },
  {
    key: "why",
    order: 4,
    data: {
      heading: "Why Work at Rotex",
      description: "Build practical solutions, learn continuously, and contribute to systems that power industries.",
      cards: [
        { title: "Purpose-driven engineering", description: "At Rotex, every solution is built to solve real industrial challenges. Work here directly contributes to systems that improve reliability, safety, and efficiency across industries.", image: "/media/career/1.png" },
        { title: "Ownership from day one", description: "We believe in trusting people early. You are encouraged to take responsibility, make decisions, and learn through real projects rather than passive observation.", image: "/media/career/2.png" },
        { title: "Continuous learning culture", description: "Growth is part of the work, not separate from it. Teams learn by building, experimenting, and improving together in a structured and supportive environment.", image: "/media/career/3.png" },
        { title: "Precision in everything we do", description: "Attention to detail defines our approach. From design to execution, every step is guided by accuracy, quality, and system-level thinking.", image: "/media/career/4.png" },
        { title: "Collaborative environment", description: "We work as one team across functions. Ideas are shared openly, feedback is valued, and collaboration drives better outcomes.", image: "/media/career/5.png" },
        { title: "Impact that matters", description: "The work you do here goes beyond screens and systems. It supports industries that power everyday life, making your contribution meaningful and visible.", image: "/media/career/6.png" },
      ],
    },
  },
  {
    key: "positions",
    order: 5,
    data: { heading: "Open Positions" },
  },
  {
    key: "form",
    order: 6,
    data: {
      heading: "Start Your Journey With Us",
      description: "Share your details and portfolio, our team will get in touch with you",
      benefits: [
        "Work on real, impactful projects",
        "Collaborative and supportive team culture",
        "Opportunities to learn and grow continuously",
        "Exposure to diverse industries and challenges",
        "Space to bring your ideas to life",
        "Transparent and structured work environment",
      ],
      experienceOptions: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"],
    },
  },
];

type JobSeed = {
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  employmentType?: string;
  workMode?: string;
  aboutRole?: string;
  whatYouDo?: string[];
  whatWeLookFor?: string[];
  whatYouGet?: { icon: string; label: string }[];
};

const JOBS: JobSeed[] = [
  {
    company: "Rotex Automation Limited",
    title: "Quality Assurance Engineer",
    category: "Engineering",
    location: "Vadodara, India",
    tag: "Solenoid Valves",
    employmentType: "Full-time",
    workMode: "Hybrid",
    aboutRole:
      "Lead the design and development of next-generation instrumentation systems for critical fluid control applications. Work directly with R&D to push the boundaries of precision engineering.",
    whatYouDo: [
      "Design and validate instrumentation systems for high-pressure valve assemblies",
      "Collaborate with manufacturing to ensure design feasibility and quality",
      "Lead testing protocols for SIL3-rated safety systems",
      "Mentor junior engineers and contribute to technical documentation",
      "Interface with clients to understand application-specific requirements",
    ],
    whatWeLookFor: [
      "7+ years experience in instrumentation engineering, preferably in process control",
      "Strong understanding of ISA standards and functional safety (SIL)",
      "Experience with CAD tools (SolidWorks, AutoCAD)",
      "Excellent problem-solving and communication skills",
      "Bachelor's or Master's in Instrumentation/Electronics Engineering",
    ],
    whatYouGet: [
      { icon: "dollar-sign", label: "Competitive Pay" },
      { icon: "building", label: "Health Cover" },
      { icon: "graduation-cap", label: "L&D Budget" },
      { icon: "plane", label: "Travel Opps" },
    ],
  },
];

// The gallery admin picker selects from the Media Library, so the seeded
// static gallery images need a matching MediaAsset row or they show up as
// "0 selected" and get wiped on the next save.
const GALLERY_MEDIA = [
  { url: "/media/career/gallery/1.png", filename: "1.png", alt: "Rotex team at the manufacturing facility" },
  { url: "/media/career/gallery/2.png", filename: "2.png", alt: "Precision machining on the factory floor" },
  { url: "/media/career/gallery/3.png", filename: "3.png", alt: "Rotex team at the manufacturing facility" },
  { url: "/media/career/gallery/4.png", filename: "4.png", alt: "Valve testing on the shop floor" },
];

async function main() {
  for (const section of SECTIONS) {
    await prisma.careerSection.upsert({
      where: { key: section.key },
      update: { order: section.order, data: section.data as never },
      create: { key: section.key, order: section.order, enabled: true, data: section.data as never },
    });
  }
  console.log(`Seeded ${SECTIONS.length} career sections.`);

  for (const media of GALLERY_MEDIA) {
    const existing = await prisma.mediaAsset.findFirst({ where: { url: media.url } });
    if (!existing) {
      await prisma.mediaAsset.create({ data: { ...media, type: "image" } });
    }
  }
  console.log(`Registered ${GALLERY_MEDIA.length} career gallery media assets.`);

  const existingJobs = await prisma.jobPosting.count();
  if (existingJobs === 0) {
    for (const job of JOBS) {
      await prisma.jobPosting.create({ data: job });
    }
    console.log(`Seeded ${JOBS.length} job postings.`);
  } else {
    console.log(`Skipped job postings seed — ${existingJobs} already exist.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
