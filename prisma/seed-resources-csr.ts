import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

type SeedResource = {
  type: string;
  slug: string;
  title: string;
  image: string;
  extraTags: string[];
  content: string;
};

const RESOURCES: SeedResource[] = [
  {
    type: "csr",
    slug: "ssg-hospital-medical-equipment-donation",
    title: "Rotex Automation Elevates Neurosurgical Care at SSG Hospital with Significant CSR Contribution",
    image:
      "https://rotexautomation.com/wp-content/uploads/2026/05/Rotex-Automation-Empowers-SSG-Hospital-with-Advanced-Neurosurgery-Equipment-2.png",
    extraTags: ["Healthcare", "Medical Equipment Donation"],
    content: `Rotex Automation Limited donated approximately 42,000 USD in state-of-the-art medical equipment to SSG Hospital's Neurosurgery Department in Vadodara. The contribution aims to provide free advanced brain and spinal surgeries to underserved patients in the region.

The donation includes three key technologies: a Flat Panel C-Arm Machine for real-time surgical imaging, an Electric Radiolucent Operating Table for unrestricted imaging during procedures, and Neuro-Drill Attachments to streamline cranial surgery operations.

Managing Director Rajesh Shah stated: "I feel happy that I got this opportunity to serve the community and, as Rotex, we can give it back to society."

Dr. Ankit Shah, neurosurgeon at SSG Hospital, praised the equipment: "This technology will allow us to provide better care, achieve better results, and offer better treatment to our patients."

The company views its corporate success as interconnected with societal well-being and remains committed to supporting vital public healthcare institutions.`,
  },
  {
    type: "csr",
    slug: "diwali-sweets-distribution-divya-roshni",
    title: "Diwali Celebration with Children at Divya Roshni Foundation",
    image: "https://rotexautomation.com/wp-content/uploads/2025/10/Rotex-Building-edited.webp",
    extraTags: ["Community", "Children"],
    content: `Rotex Automation marked the festival of lights by visiting Divya Roshni Foundation on October 18th, 2025, to distribute chocolates and festive treats to children. The tagline for this initiative was: "Sharing Sweets, Spreading Smiles."

The team's visit focused on creating memorable moments and bringing joy during the festive season. Rather than simply giving gifts, the company emphasized the importance of making the children feel valued and celebrated.

The company explained their rationale: "Diwali is a reminder that light can conquer darkness — and kindness can brighten lives." Their goals included spreading joy, encouraging community bonding, and celebrating with vulnerable populations.

Rotex employees participated enthusiastically in the event, creating a compassionate gathering centered on giving and connection. The organization stated it remains committed to leveraging festivals as opportunities for societal contribution, supporting marginalized communities, and fostering a workplace culture grounded in empathy and social responsibility.`,
  },
  {
    type: "csr",
    slug: "csr-joy-of-giving-week-2025",
    title: "Joy of Giving Week 2025 at Rotex",
    image: "https://rotexautomation.com/wp-content/uploads/2025/10/Rotex-Building-edited.webp",
    extraTags: ["Community", "Education", "Children"],
    content: `Rotex Automation observed Daan Utsav on October 11, 2025, celebrating what the company describes as "Spreading Happiness, Sharing Hope." The event represented the organization's dedication to generosity and community impact.

The company's contributions included donating playground equipment to Divya Roshni Foundation and distributing educational supplies plus clothing to The Missionaries of Charity and Don Bosco Snehalaya Children's Home.

These efforts brought happiness and play opportunities to underprivileged children while simultaneously supporting education initiatives. Staff members participated enthusiastically, demonstrating that the organization values compassion and teamwork.

The company emphasized its ongoing commitment to social responsibility, noting that employee participation strengthened community bonds. Rotex framed such initiatives as catalysts for broader societal transformation, encouraging staff and business associates to contribute meaningfully to their communities through collective action.`,
  },
  {
    type: "csr",
    slug: "mou-with-xavier-iti",
    title: "Rotex Signs MoU with Xavier ITI under Learn and Earn Scheme",
    image: "https://rotexautomation.com/wp-content/uploads/2025/10/Rotex-Building-edited.webp",
    extraTags: ["Education", "Skill Development"],
    content: `Rotex Automation announced a partnership with Xavier Industrial Training Institute through their CSR initiative called Prerna – Inspiring Positive Change. The collaboration focuses on the "Learn and Earn" Scheme, designed to bridge gaps between classroom instruction and practical experience.

The initiative aims to equip students with industry-relevant skills, provide hands-on training opportunities, and support youth in developing long-term careers. By combining theoretical knowledge with real-world exposure, the program prepares trainees for contemporary workforce demands.

The company emphasizes that "this collaboration not only strengthens academic-industry ties but also reflects Rotex's long-term commitment to shaping future innovators." Through this CSR effort, Rotex seeks to create environments where mentorship, talent development, and learning converge with income generation for participants.

The partnership demonstrates the organization's broader mission of community empowerment, skills development, and creating pathways for the next generation of professionals.`,
  },
  {
    type: "csr",
    slug: "plantation-drive-under-van-mahotsav",
    title: "Plantation Drive under Van Mahotsav 2025",
    image:
      "https://rotexautomation.com/wp-content/uploads/2025/09/Untitled-design-2-e1756811996703-1024x450.png",
    extraTags: ["Environment", "Tree Plantation"],
    content: `Rotex Automation organized a tree-planting initiative as part of their CSR program called Prerna 2025. The event commemorated Van Mahotsav 2025, a nationwide environmental celebration held from July 1-7. On July 14, 2025, staff members and company leadership gathered at the parking area in Vadodara to plant trees.

The organization highlighted the ecological benefits of afforestation, emphasizing how every sapling planted is a step toward reducing carbon footprint, creating cleaner air, preserving biodiversity, and building healthier, greener communities.

Employee engagement across departments reflected the company's philosophy that sustainability begins with individual responsibility and grows stronger through teamwork. Leadership participation underscored the organization's commitment to environmental stewardship. Rotex positioned this activity as part of broader efforts to inspire action and create an ecological legacy for future generations.`,
  },
  {
    type: "csr",
    slug: "rotex-supports-divya-roshni-foundation",
    title: "Rotex Supports Divya Roshni Foundation: Empowering the Dreams of Street Children",
    image:
      "https://rotexautomation.com/wp-content/uploads/2025/08/Rotex-Supports-Divya-Roshni-Foundation-Empowering-the-Dreams-of-Street-Children-2.webp",
    extraTags: ["Community", "Education", "Children"],
    content: `Rotex partnered with the Divya Roshni Foundation, an NGO focused on supporting education and holistic development for street children, as part of their CSR initiative titled "Prerna – Inspiring Positive Change."

The company's employees visited the children at the foundation, engaging in interactive sessions, storytelling, and playful activities. They brought books, clothes, and toys as donations, building meaningful connections with the children.

The organization emphasizes that "Education is more than literacy it is the foundation of empowerment." Through this partnership, Rotex aims to provide equal opportunities, break poverty cycles, and foster a more inclusive society.

The initiative relied on volunteer participation from Rotex staff members who actively contributed to making the day memorable. The company states: "At Rotex, we remain committed to building a future where no child is left behind," and plans to continue supporting education-focused initiatives throughout 2025.`,
  },
];

async function main() {
  for (const resource of RESOURCES) {
    await prisma.resource.upsert({
      where: { type_slug: { type: resource.type, slug: resource.slug } },
      update: resource,
      create: { ...resource, published: true },
    });
  }

  console.log(`Seeded ${RESOURCES.length} CSR resources.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
