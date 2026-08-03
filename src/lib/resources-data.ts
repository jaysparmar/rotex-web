export type PostSection = {
  heading: string;
  description: string;
  image?: string;
};

export type PostDetail = {
  intro: string;
  sections: PostSection[];
};

export type ResourcePost = {
  slug: string;
  title: string;
  image: string;
  date: string;
  product: string;
  industry: string;
  extraTags?: string[];
  detail?: PostDetail;
};

const IMG_1 = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80";
const IMG_2 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";
const IMG_3 = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80";
const IMG_4 = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80";
const IMG_5 = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80";
const IMG_6 = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80";

export const RESOURCE_POSTS: ResourcePost[] = [
  {
    slug: "right-solenoid-valve-manufacturer-supplier",
    title:
      "How to Choose the Right Solenoid Valve Manufacturer or Supplier for Industrial Applications?",
    image: IMG_1,
    date: "January 25, 2026",
    product: "Solenoid Valve",
    industry: "Oil & Gas",
    extraTags: ["Automation", "Manufacturing", "Process Industry", "Machine Solutions"],
    detail: {
      intro:
        "Selecting a solenoid valve manufacturer is far more than a procurement decision - It is a reliability-critical engineering decision that directly affects system uptime, process stability, maintenance cost and operational safety.\nA single valve failure in a critical process can trigger production shutdowns, equipment damage, safety incidents, and unplanned downtime costing thousands of dollars per hour.\nIn industrial automation systems, solenoid valves control the flow of air, gas, water, steam, and process fluids under defined pressure and temperature conditions. The reliability of these valves depends not only on valve sizing and configuration but also on the engineering capability and manufacturing consistency of the supplier.\nIndustrial solenoid valves are engineered components that must perform consistently across variable voltage conditions, extreme temperatures, contaminated media, and continuous-duty cycles. These issues can cause process interruptions, unsafe operating conditions, and increased maintenance frequency.",
      sections: [
        {
          heading: "What is an Industrial Solenoid Valve Manufacturer or Supplier?",
          description: "The supplier type directly affects system reliability and maintainability.",
          image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80",
        },
        {
          heading: "Why the Distinction Matters: Three Critical Scenarios",
          description:
            "An industrial solenoid valve manufacturer or supplier is an organization involved in producing or delivering solenoid valves for industrial automation and process control applications. Different types of suppliers exist, and understanding the distinction is essential for engineering reliability.",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
        },
        {
          heading: "How Industrial Solenoid Valve Supply Works?",
          description:
            "Industrial solenoid valve supply involves a structured process from engineering design to lifecycle support.",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
        },
        {
          heading: "Material Engineering",
          description:
            "Body, seal, and coil materials must be matched to media compatibility, pressure rating, and duty cycle - shortcuts here are the leading cause of premature valve failure in the field.",
        },
        {
          heading: "Industrial Challenges When Working with Solenoid Valve Suppliers",
          description:
            "Lead time variability, inconsistent batch quality, and weak after-sales support are the most common friction points reported by plant engineering teams.",
        },
        {
          heading: "Conclusion",
          description:
            "Choosing the right solenoid valve manufacturer or supplier is a reliability decision, not just a purchasing one - evaluate engineering depth, quality consistency, and lifecycle support before committing.",
        },
      ],
    },
  },
  {
    slug: "pressure-regulators-water-treatment",
    title: "Understanding the Importance of Pressure Regulators in Water Treatment Processes",
    image: IMG_2,
    date: "February 2, 2026",
    product: "Actuator",
    industry: "Oil & Gas",
    extraTags: ["Water Treatment", "Process"],
  },
  {
    slug: "flow-meter-chemical-applications",
    title: "Selecting the Best Flow Meter for Accurate Measurement in Chemical Applications",
    image: IMG_3,
    date: "March 30, 2026",
    product: "EHF",
    industry: "Automation",
    extraTags: ["Chemical", "Process"],
  },
  {
    slug: "choosing-right-actuator-manufacturing-engineers",
    title: "Choosing the Right Actuator: A Guide for Manufacturing Engineers",
    image: IMG_4,
    date: "February 18, 2026",
    product: "Actuators",
    industry: "Machine Solution",
    extraTags: ["Manufacturing", "Automation"],
  },
  {
    slug: "thermostatic-valves-hvac-systems",
    title: "Key Considerations When Selecting Thermostatic Valves for HVAC Systems",
    image: IMG_5,
    date: "March 5, 2026",
    product: "CTIS",
    industry: "Pharma",
    extraTags: ["HVAC", "Process"],
  },
  {
    slug: "optimize-automation-pneumatic-cylinder",
    title: "How to Optimize Your Automation Process with the Right Pneumatic Cylinder",
    image: IMG_6,
    date: "April 9, 2026",
    product: "Solenoid Valve",
    industry: "Oil & Gas",
    extraTags: ["Automation", "Cylinder"],
  },
  {
    slug: "valve-sizing-high-pressure-steam",
    title: "Valve Sizing for High-Pressure Steam Lines: A Practical Engineering Guide",
    image: IMG_1,
    date: "April 18, 2026",
    product: "Solenoid Valve",
    industry: "Power",
    extraTags: ["Steam", "Sizing"],
  },
  {
    slug: "predictive-maintenance-flow-control",
    title: "Predictive Maintenance for Flow Control Assets: What Actually Works",
    image: IMG_2,
    date: "April 26, 2026",
    product: "Actuator",
    industry: "Process Industry",
    extraTags: ["Maintenance", "IIoT"],
  },
  {
    slug: "atex-compliance-hazardous-areas",
    title: "ATEX Compliance in Hazardous Areas: A Specification Checklist",
    image: IMG_3,
    date: "May 4, 2026",
    product: "EHF",
    industry: "Oil & Gas",
    extraTags: ["Safety", "Certification"],
  },
  {
    slug: "reducing-air-consumption-pneumatics",
    title: "Reducing Compressed Air Consumption Across Pneumatic Systems",
    image: IMG_4,
    date: "May 12, 2026",
    product: "CTIS",
    industry: "Automotive",
    extraTags: ["Efficiency", "Energy"],
  },
  {
    slug: "seat-material-selection-corrosive-media",
    title: "Seat Material Selection for Corrosive and Abrasive Media",
    image: IMG_5,
    date: "May 20, 2026",
    product: "Solenoid Valve",
    industry: "Pharma",
    extraTags: ["Materials", "Corrosion"],
  },
  {
    slug: "commissioning-checklist-process-plants",
    title: "A Commissioning Checklist for Flow Control in New Process Plants",
    image: IMG_6,
    date: "May 28, 2026",
    product: "Actuator",
    industry: "Process Industry",
    extraTags: ["Commissioning", "QA"],
  },
  {
    slug: "sil-rated-shutdown-systems",
    title: "Designing SIL-Rated Emergency Shutdown Systems That Hold Up",
    image: IMG_1,
    date: "June 6, 2026",
    product: "EHF",
    industry: "Oil & Gas",
    extraTags: ["SIL", "Safety"],
  },
  {
    slug: "rail-braking-automation-standards",
    title: "Automation Standards for Rail Braking and Door Control Systems",
    image: IMG_2,
    date: "June 15, 2026",
    product: "CTIS",
    industry: "Rail",
    extraTags: ["Rail", "Standards"],
  },
  {
    slug: "cleanroom-valve-requirements",
    title: "Cleanroom Valve Requirements for Pharmaceutical Manufacturing",
    image: IMG_3,
    date: "June 23, 2026",
    product: "Solenoid Valve",
    industry: "Pharma",
    extraTags: ["Cleanroom", "GMP"],
  },
  {
    slug: "retrofit-legacy-actuators",
    title: "Retrofitting Legacy Actuators Without Replacing the Whole Line",
    image: IMG_4,
    date: "July 1, 2026",
    product: "Actuator",
    industry: "Machine Solutions",
    extraTags: ["Retrofit", "Upgrade"],
  },
  {
    slug: "aerospace-test-rig-flow-control",
    title: "Flow Control for Aerospace Test Rigs: Precision Under Extreme Cycles",
    image: IMG_5,
    date: "July 9, 2026",
    product: "EHF",
    industry: "Aerospace & Defence",
    extraTags: ["Aerospace", "Testing"],
  },
  {
    slug: "total-cost-ownership-valves",
    title: "Total Cost of Ownership: Why the Cheapest Valve Rarely Is",
    image: IMG_6,
    date: "July 17, 2026",
    product: "Solenoid Valve",
    industry: "Process Industry",
    extraTags: ["TCO", "Procurement"],
  },
];

export type NewsItem = { slug: string; title: string; date: string };

export const FEATURED_NEWS: NewsItem[] = [
  {
    slug: "rotex-expands-advanced-solutions-automotive-market",
    title: "Rotex expands advanced solutions for India's automotive market",
    date: "April 9, 2026",
  },
  {
    slug: "game-changing-flow-tech-commercial-vehicles",
    title: "Game-changing flow tech for commercial vehicles",
    date: "January 25, 2026",
  },
  {
    slug: "rotex-opens-new-manufacturing-unit",
    title: "Rotex opens new manufacturing unit to scale automation output",
    date: "March 30, 2026",
  },
  {
    slug: "partnership-rail-sector-automation",
    title: "New partnership brings smart automation to the rail sector",
    date: "February 18, 2026",
  },
  {
    slug: "rotex-wins-innovation-award-2026",
    title: "Rotex wins Innovation Award for next-gen valve design",
    date: "March 5, 2026",
  },
  {
    slug: "aerospace-defense-supply-milestone",
    title: "Rotex crosses major supply milestone in aerospace & defense",
    date: "February 2, 2026",
  },
  {
    slug: "rotex-showcases-ctis-at-expo-2026",
    title: "Rotex showcases CTIS technology at Industrial Expo 2026",
    date: "April 20, 2026",
  },
  {
    slug: "sustainability-in-valve-manufacturing",
    title: "How Rotex is driving sustainability in valve manufacturing",
    date: "May 3, 2026",
  },
];

export function getPostTags(post: ResourcePost): string[] {
  return [post.product, post.industry, ...(post.extraTags ?? [])];
}

export function getPostDetail(post: ResourcePost): PostDetail {
  if (post.detail) return post.detail;
  return {
    intro: `${post.title} is a reliability-critical decision for engineering and procurement teams working with ${post.product.toLowerCase()} systems in ${post.industry.toLowerCase()} applications.\nGetting this right affects system uptime, maintenance cost, and long-term operational safety.`,
    sections: [
      {
        heading: `Why It Matters`,
        description: `${post.product} selection directly impacts process stability and total cost of ownership across the equipment lifecycle.`,
        image: post.image,
      },
      {
        heading: `Key Considerations`,
        description: `Engineering teams should evaluate media compatibility, duty cycle, and after-sales support before committing to a supplier or product line.`,
      },
      {
        heading: `Conclusion`,
        description: `A structured evaluation process reduces downtime risk and ensures long-term reliability for ${post.industry.toLowerCase()} operations.`,
      },
    ],
  };
}
