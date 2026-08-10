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
  product: string;
  industry: string;
  extraTags: string[];
  content: string;
};

const RESOURCES: SeedResource[] = [
  {
    type: "blogs",
    slug: "right-solenoid-valve-manufacturer-supplier",
    title: "How to Choose the Right Solenoid Valve Manufacturer or Supplier for Industrial Applications?",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    product: "Solenoid Valve",
    industry: "Oil & Gas",
    extraTags: ["Automation", "Manufacturing", "Process Industry"],
    content: `Selecting a solenoid valve manufacturer is far more than a procurement decision — it is a reliability-critical engineering decision that directly affects system uptime, process stability, maintenance cost, and operational safety.

A single valve failure in a critical process can trigger production shutdowns, equipment damage, safety incidents, and unplanned downtime costing thousands of dollars per hour. In industrial automation systems, solenoid valves control the flow of air, gas, water, steam, and process fluids under defined pressure and temperature conditions.

## What Is an Industrial Solenoid Valve Manufacturer or Supplier?

The supplier type directly affects system reliability and maintainability. An industrial solenoid valve manufacturer or supplier is an organization involved in producing or delivering solenoid valves for industrial automation and process control applications.

## Why the Distinction Matters: Three Critical Scenarios

Different types of suppliers exist, and understanding the distinction is essential for engineering reliability:

- **True manufacturers** design and machine the valve body, coil, and internals in-house.
- **Assemblers** source components and assemble under their own brand.
- **Distributors** resell another manufacturer's product with little to no engineering input.

## How Industrial Solenoid Valve Supply Works

Industrial solenoid valve supply involves a structured process from engineering design to lifecycle support:

1. Application review — media, pressure, temperature, duty cycle
2. Material selection — body, seal, and coil matched to the operating envelope
3. Testing and certification — pressure testing, cycle testing, hazardous-area approvals
4. Delivery and after-sales support

## Material Engineering

Body, seal, and coil materials must be matched to media compatibility, pressure rating, and duty cycle — shortcuts here are the leading cause of premature valve failure in the field.

## Conclusion

Choosing the right solenoid valve manufacturer or supplier is a reliability decision, not just a purchasing one. Evaluate engineering depth, quality consistency, and lifecycle support before committing.`,
  },
  {
    type: "blogs",
    slug: "valve-sizing-high-pressure-steam",
    title: "Valve Sizing for High-Pressure Steam Lines: A Practical Engineering Guide",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80",
    product: "Solenoid Valve",
    industry: "Power",
    extraTags: ["Steam", "Sizing"],
    content: `Undersized valves choke flow and starve downstream equipment; oversized valves waste capital and introduce control instability. Getting steam valve sizing right is a first-principles engineering exercise, not a rule of thumb.

## Why Steam Sizing Is Different

Steam is compressible and prone to flashing across a pressure drop, which changes the effective Cv calculation compared to liquid service.

## The Sizing Process

1. Establish the required flow rate at worst-case operating conditions
2. Confirm upstream and downstream pressure, including any pressure-reducing stations
3. Calculate Cv using steam-specific sizing equations
4. Select a valve with margin for future capacity, not a fixed multiplier applied blindly

## Common Mistakes

- Sizing for average flow instead of peak demand
- Ignoring pressure drop across strainers and fittings
- Specifying a valve trim that can't handle wet steam at startup

## Conclusion

Steam valve sizing rewards careful process data collection over shortcuts — the cost of getting it wrong shows up as chronic instability, not a single dramatic failure.`,
  },
  {
    type: "case-studies",
    slug: "rail-braking-automation-standards",
    title: "Automation Standards for Rail Braking and Door Control Systems",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    product: "CTIS",
    industry: "Rail",
    extraTags: ["Rail", "Standards"],
    content: `A rolling stock manufacturer needed a valve platform that could pass rail-specific vibration, EMC, and fire-safety certification without a redesign cycle for every new fleet order.

## The Challenge

Rail braking and door control systems operate in a uniquely demanding environment — continuous vibration, wide temperature swings, and strict fire-behaviour requirements under EN 45545.

## The Approach

Rotex worked with the manufacturer's systems engineering team from the concept phase, selecting materials and coil insulation classes that were already proven against the relevant rail standards, avoiding a late-stage requalification.

## The Outcome

- Certification achieved on the first submission cycle
- A shared valve platform reused across three rolling stock programs
- Reduced spare-parts complexity for the operator's maintenance depots

## Conclusion

Standards compliance is cheapest when it's designed in from the first engineering conversation, not retrofitted after a failed test.`,
  },
  {
    type: "case-studies",
    slug: "cleanroom-valve-requirements",
    title: "Cleanroom Valve Requirements for Pharmaceutical Manufacturing",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
    product: "Solenoid Valve",
    industry: "Pharma",
    extraTags: ["Cleanroom", "GMP"],
    content: `A pharmaceutical manufacturer needed to replace an aging valve fleet across a GMP cleanroom without interrupting production, while meeting stricter particulate and cleanability requirements than the original installation.

## The Challenge

Cleanroom-rated valves must minimise particle generation, tolerate aggressive CIP/SIP cycles, and carry documentation that satisfies GMP audit trails.

## The Approach

A phased replacement plan was built around the facility's existing maintenance windows, with each valve batch pre-validated off-site before installation to avoid extending cleanroom downtime.

## The Outcome

- Zero unplanned production stoppages during the changeover
- Full documentation package delivered ahead of the next regulatory audit
- Reduced valve-related contamination flags in subsequent inspections

## Conclusion

In regulated environments, the installation plan is as much a deliverable as the hardware itself.`,
  },
  {
    type: "news",
    slug: "rotex-opens-new-manufacturing-unit",
    title: "Rotex Opens New Manufacturing Unit to Scale Automation Output",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80",
    product: "Solenoid Valve",
    industry: "Automation",
    extraTags: ["Expansion"],
    content: `Rotex has opened a new manufacturing unit dedicated to scaling production of its solenoid valve and actuator lines, expanding total manufacturing footprint to meet growing global demand.

## What's New

The new facility adds precision CNC machining capacity and an expanded testing lab, shortening lead times on high-volume valve configurations.

## Why It Matters

Customers across Oil & Gas, Power, and Automotive segments have flagged lead time as a recurring constraint on project timelines — this expansion is a direct response to that feedback.

## What's Next

Commissioning of the second production line is planned for the following quarter, with capacity ramping through the rest of the year.`,
  },
  {
    type: "news",
    slug: "rotex-wins-innovation-award-2026",
    title: "Rotex Wins Innovation Award for Next-Gen Valve Design",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
    product: "Actuator",
    industry: "Industrial Automation",
    extraTags: ["Award"],
    content: `Rotex has been recognised with an industry innovation award for its next-generation solenoid valve spool design, engineered to eliminate the most common root cause of premature valve failure in contaminated media applications.

## The Recognition

The award panel cited the design's measurable reduction in field failure rates as the deciding factor.

## Background

The redesign followed an internal root-cause analysis that traced a majority of warranty claims to a single failure mode — contamination ingress around conventional spool geometries.

## Looking Ahead

The new spool design is being rolled into the standard product line across applicable valve series.`,
  },
  {
    type: "blogs",
    slug: "flow-control-oil-gas",
    title: "Flow Control in the Oil & Gas Industry: Challenges and Solutions",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    product: "Solenoid Valve",
    industry: "Oil & Gas",
    extraTags: ["Flow Control", "Upstream"],
    content: `Flow control in oil and gas operations sits at the intersection of process efficiency and safety — a poorly specified valve doesn't just cost throughput, it can become the weak point in an emergency shutdown chain.

## The Core Challenges

Upstream and midstream facilities push valves through conditions few other industries demand simultaneously: high-pressure sour gas, abrasive slurries, and wide ambient temperature swings on unmanned platforms.

- **Corrosive media** — H2S and CO2 content demands NACE-compliant materials, not standard trims
- **Remote operation** — unmanned platforms need valves that fail to a safe state without local intervention
- **Pressure cycling** — repeated high-differential cycling accelerates seat wear far faster than steady-state service

## Engineering Solutions

1. Material selection driven by media analysis, not a generic corrosion allowance
2. Fail-safe actuation (spring-return or fail-closed) specified at the P&ID stage, not retrofitted
3. Third-party API 6D or API 598 testing before the valve ever reaches site

## Choosing the Right Partner

A supplier who understands sour service metallurgy and can produce mill certificates on demand is worth more than a marginally lower unit price — rework and NDT failures on site cost far more than the valve itself.

## Conclusion

Flow control decisions made at the design stage determine whether a facility's shutdown systems are trustworthy years later. Specify for the worst case, not the average day.`,
  },
  {
    type: "case-studies",
    slug: "solenoid-valve-classification",
    title: "Solenoid Valve Classification: The Engineering Logic Behind Reliable Automation Systems",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    product: "Solenoid Valve",
    industry: "Process Industries",
    extraTags: ["Classification", "Engineering"],
    content: `A systems integrator serving multiple process industries needed a single reference framework to specify solenoid valves consistently across projects, instead of re-deriving requirements from scratch for every client.

## The Challenge

Without a shared classification system, engineers were specifying valves by brand and part number rather than by function — direct-acting vs. pilot-operated, normally open vs. normally closed — leading to mismatched replacements and inconsistent BOMs across sites.

## The Approach

Rotex worked with the integrator's engineering team to build a classification matrix grounded in three variables: operating principle (direct vs. pilot-operated), port configuration (2-way, 3-way, 5-way), and default state (NO/NC). Every valve in the integrator's catalog was mapped against this matrix.

## The Outcome

- A standardized specification sheet reused across all new project quotes
- Reduced valve mis-selection incidents during commissioning by a significant margin
- Faster onboarding for new engineers, who now reference one framework instead of tribal knowledge

## Conclusion

Classification isn't academic — it's the difference between a spec sheet an engineer can trust and one that needs a phone call to verify.`,
  },
  {
    type: "news",
    slug: "global-expansion",
    title: "Rotex Expands Global Distribution Network Across 15 New Markets",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
    product: "Solenoid Valve",
    industry: "Industrial Automation",
    extraTags: ["Expansion", "Distribution"],
    content: `Rotex has expanded its global distribution network into 15 new markets, extending local stocking and technical support to customers across regions previously served only through export channels.

## What's New

The expansion adds authorized distribution partners across new geographies, each stocking core valve and actuator lines locally to cut lead times on standard configurations.

## Why It Matters

Customers in newly added regions previously faced multi-week shipping windows for replacement parts. Local stocking through the expanded network brings that down to days for the most commonly ordered items.

## What's Next

Rotex plans to extend local technical training programs to each new distribution partner over the coming quarters, ensuring first-line support is available close to the customer, not just inventory.`,
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

  console.log(`Seeded ${RESOURCES.length} resources.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
