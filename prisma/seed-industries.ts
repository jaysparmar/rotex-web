import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

type CustomerStorySeed = { quote: string; author: string; company: string; image: string };

type SubIndustrySeed = {
  slug: string;
  name: string;
  description: string;
  challengesTitle: string;
  solutionsTitle: string;
  solutionsIntro: string;
  challenges: string[];
  solutions: string[];
  recommendedProducts: string[];
  customerStories: CustomerStorySeed[];
};

type IndustrySeed = {
  slug: string;
  name: string;
  bgKey?: string;
  image: string;
  description: string;
  sectionTitle: string;
  overview: string;
  stats: { value: string; suffix?: string; label: string }[];
  whyChoose: { title: string; highlight: string; cards: { title: string; description: string }[] };
  subIndustries: SubIndustrySeed[];
};

const INDUSTRIES: IndustrySeed[] = [
  {
    slug: "oil-gas",
    name: "Oil & Gas",
    bgKey: "oil",
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&q=80",
    description:
      "Flow intelligence that performs where pressure, precision, and uptime are non-negotiable. From upstream volatility to downstream complexity, Rotex enables control that adapts, responds, and delivers.",
    sectionTitle: "Redefining Flow Control in Oil & Gas",
    overview:
      "Oil and gas operations run in some of the world's most demanding and safety-critical environments across upstream wellheads, midstream pipelines, and downstream refineries. The volatile nature of hydrocarbons, combined with complex extraction and processing systems, creates conditions where even minor deviations can lead to severe operational, environmental, and financial consequences. From offshore platforms to remote drilling sites, operations face constant challenges including extreme pressures, high temperatures, and limited accessibility. These conditions place immense stress on equipment and demand systems that can perform reliably without interruption. Downtime is not a delay — it is a direct loss of safety, output, and revenue. At the same time, stringent regulatory requirements and increasing environmental scrutiny require continuous improvements in safety, control, and operational efficiency. Rotex addresses these challenges through a systems-led approach to flow control, purpose-engineered for the demands of oil and gas. Solenoid valves, actuators, positioners, and electrohydraulic systems work together as an integrated intelligence layer within the process. This enables faster response, precise control, and fail-safe operation across upstream, midstream, and downstream environments. The result is safer operations, improved reliability, and consistent performance — helping operators run critical assets safely, efficiently, and without compromise across every stage of oil and gas production and processing.",
    stats: [
      { value: "23", label: "Refineries in India" },
      { value: "57", suffix: "+", label: "Years of Reliability" },
    ],
    whyChoose: {
      title: "Why Choose Rotex for",
      highlight: "Oil & Gas",
      cards: [
        { title: "Precision Under Pressure", description: "Engineered for high-pressure, high-temperature applications where even the smallest deviation can have significant consequences." },
        { title: "Fail-Safe by Design", description: "With advanced EHF actuator systems and intelligent control mechanisms, safety isn't an add-on. It's embedded into every operation." },
        { title: "System-Level Responsiveness", description: "Our solutions sense, adjust, and respond dynamically to changing process conditions." },
        { title: "Relentless Customization", description: "No two flow environments are identical. Rotex solutions are tailored to your exact process, ensuring optimal performance in real-world conditions." },
        { title: "High-Cycle Reliability", description: "Built to withstand continuous operations with minimal wear, reducing downtime and extending system life." },
        { title: "Global Standards Compliance", description: "Every component meets API, ATEX, IECEx, and SIL safety standards, ensuring seamless deployment across global oil and gas operations." },
        { title: "Single-Supplier Integration", description: "From solenoid valves to full EHF actuator packages, Rotex simplifies your supply chain with fully integrated, pre-engineered solutions." },
        { title: "Field-Proven Heritage", description: "Decades of deployment across Indian and international refineries, pipelines, and offshore platforms validate our engineering approach in the most demanding environments." },
      ],
    },
    subIndustries: [
      {
        slug: "upstream",
        name: "Upstream",
        description: "Upstream oil & gas operations take place in some of the harshest and most safety-critical environments, from onshore wellheads and gathering systems to offshore platforms and remote production facilities. Reliable process automation is essential to keep production running and operators safe.",
        challengesTitle: "Process Challenges in Upstream Operation",
        solutionsTitle: "Rotex Solutions for Upstream Applications",
        solutionsIntro: "Rotex offers reliable process automation engineered for the harshest and most safety-critical operating environments, delivering:",
        challenges: [
          "Reliable performance in extreme temperatures, pressures, and hazardous atmospheres",
          "Accurate process control under variable well conditions",
          "Safe and dependable emergency shutdown (ESD) performance across remote and offshore locations",
          "Compliance with strict environmental and safety standards",
        ],
        solutions: [
          "Rugged construction for harsh upstream environments",
          "Fast, reliable response for ESD and process safety duty",
          "Accurate, repeatable control across production and gathering systems",
          "Safety-certified components with complete documentation",
          "Engineering expertise built on decades of upstream experience",
        ],
        recommendedProducts: ["Solenoid Valve", "Angle Seat Valve", "Actuators", "Positioners", "Automotive Solutions"],
        customerStories: [
          { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&q=80", quote: "Rotex solenoid valves have been instrumental in maintaining fail-safe shutdown integrity across our offshore wellheads. Zero unplanned trips in two years.", author: "Rajesh Mehta", company: "Plant Head, Aarti Industries Ltd." },
          { image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=640&q=80", quote: "The ESD actuator systems from Rotex gave us the confidence to extend our inspection intervals. Reliability has been outstanding in extreme conditions.", author: "Sunil Varma", company: "Operations Manager, ONGC" },
          { image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=640&q=80", quote: "From initial specification to commissioning, the Rotex team understood our upstream requirements and delivered exactly what our process demanded.", author: "Priya Nair", company: "Instrumentation Engineer, Cairn India" },
          { image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=640&q=80", quote: "We've standardised on Rotex valves across all our upstream platforms. The consistency of performance and documentation support is unmatched.", author: "Amir Khan", company: "Procurement Head, Reliance Industries" },
        ],
      },
      {
        slug: "midstream",
        name: "Midstream",
        description: "Midstream operations handle transportation, storage, and processing of oil, gas, and NGLs across thousands of kilometres of pipelines and compressor stations. Precision control and zero-leak integrity are non-negotiable throughout the network.",
        challengesTitle: "Process Challenges in Midstream Operation",
        solutionsTitle: "Rotex Solutions for Midstream Applications",
        solutionsIntro: "Rotex delivers proven flow control solutions for the demanding midstream environment:",
        challenges: [
          "Managing high-pressure pipeline integrity over long distances",
          "Reliable compressor station valve control with minimal downtime",
          "Leak-free performance in hydrocarbon transfer and storage",
          "Meeting safety and environmental compliance across unmanned facilities",
        ],
        solutions: [
          "High-pressure solenoid and actuated valves for pipeline control",
          "Remote-operable actuator systems for unmanned stations",
          "Bi-directional, zero-leak seat designs for custody transfer",
          "ATEX/IECEx-certified components for hazardous area compliance",
          "Proven performance in gas compression and metering applications",
        ],
        recommendedProducts: ["Solenoid Valve", "Actuators", "Positioners", "Angle Seat Valve"],
        customerStories: [
          { image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=640&q=80", quote: "Rotex's high-pressure actuated valves have held up flawlessly across 1,200 km of our gas pipeline network. Leak-free performance since day one.", author: "Deepak Sharma", company: "Pipeline Integrity Manager, GAIL India" },
          { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&q=80", quote: "Remote operability was our biggest challenge at unmanned compressor stations. Rotex delivered a solution that simply works — every time.", author: "Meena Pillai", company: "Automation Lead, Petronet LNG" },
          { image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=640&q=80", quote: "The ATEX certification and documentation package from Rotex streamlined our hazardous area compliance approval by weeks.", author: "Vikram Singh", company: "HSE Director, Indian Oil Corporation" },
          { image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=640&q=80", quote: "We evaluated five valve suppliers for our custody transfer metering stations. Rotex won on both technical merit and post-sales support.", author: "Anita Desai", company: "Project Engineer, BPCL" },
        ],
      },
      {
        slug: "downstream",
        name: "Downstream",
        description: "Downstream facilities — refineries, petrochemical plants, and distribution terminals — operate under strict process requirements. Continuous operation, precise control, and safety are critical to meeting output targets and regulatory standards.",
        challengesTitle: "Process Challenges in Downstream Operation",
        solutionsTitle: "Rotex Solutions for Downstream Applications",
        solutionsIntro: "Rotex provides precision-engineered flow control solutions purpose-built for downstream environments:",
        challenges: [
          "High-cycle operation demands across refinery process units",
          "Handling aggressive and corrosive media at elevated temperatures",
          "Maintaining uptime in continuous process plant operations",
          "Stringent regulatory and safety standards for refinery environments",
        ],
        solutions: [
          "High-cycle solenoid valves rated for continuous duty refinery service",
          "Corrosion-resistant materials and coatings for aggressive media",
          "Integrated positioner and actuator solutions for precise control",
          "Full SIL certification and documentation for safety-instrumented systems",
          "Dedicated application engineering support for complex process requirements",
        ],
        recommendedProducts: ["Solenoid Valve", "Angle Seat Valve", "Actuators", "Positioners", "Automotive Solutions"],
        customerStories: [
          { image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=640&q=80", quote: "Rotex high-cycle solenoid valves have run continuously in our refinery CDU for 18 months without a single failure. Exceptional uptime in a demanding environment.", author: "Sanjay Kapoor", company: "Plant Manager, Nayara Energy" },
          { image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=640&q=80", quote: "The SIL-certified documentation Rotex provided allowed us to pass our safety case audit without any corrective actions. A rare outcome.", author: "Lakshmi Iyer", company: "Safety Systems Engineer, HPCL" },
          { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&q=80", quote: "Corrosion was destroying our previous valve stock within six months. The Rotex coated series has exceeded 24 months with no visible degradation.", author: "Ravi Kumar", company: "Maintenance Head, MRPL" },
          { image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=640&q=80", quote: "The integrated positioner and actuator solution from Rotex gave us the precise control we needed for our cat cracker slide valves.", author: "Fiona D'Souza", company: "Process Engineer, Bharat Petroleum" },
        ],
      },
    ],
  },
  {
    slug: "power-generation",
    name: "Power",
    bgKey: "power",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80",
    description:
      "High-cycle, high-reliability valve and actuator solutions engineered for the continuous demands of thermal, hydro, and renewable power plants.",
    sectionTitle: "Enabling Reliable Power Generation",
    overview:
      "Power generation plants operate around the clock under extreme thermal and mechanical loads. Whether thermal, hydro, or renewable, every facility depends on precise flow control to regulate steam, cooling water, and fuel. Rotex delivers high-cycle solenoid valves and actuators built for the continuous, unforgiving demands of power infrastructure — ensuring uptime, safety, and grid reliability.",
    stats: [
      { value: "40", suffix: "+", label: "Power Plants Served" },
      { value: "57", suffix: "+", label: "Years of Reliability" },
    ],
    whyChoose: {
      title: "Why Choose Rotex for",
      highlight: "Power Generation",
      cards: [
        { title: "High-Cycle Endurance", description: "Built for millions of cycles without degradation in steam, water, and fuel service." },
        { title: "Thermal Stability", description: "Operates reliably across extreme temperature ranges in boiler and turbine control applications." },
        { title: "Grid-Critical Reliability", description: "Zero-compromise uptime for facilities where every minute of downtime has grid-wide consequences." },
        { title: "Rapid Response", description: "Fast-acting solenoid and actuator systems ensure immediate response to turbine trip and safety demands." },
      ],
    },
    subIndustries: [
      {
        slug: "thermal",
        name: "Thermal Power",
        description: "Thermal power stations require uninterrupted steam and fuel control across boilers, turbines, and condensers operating at extreme temperatures and pressures.",
        challengesTitle: "Challenges in Thermal Power",
        solutionsTitle: "Rotex Solutions for Thermal Power",
        solutionsIntro: "Rotex delivers reliable flow control for thermal power environments:",
        challenges: [
          "High-temperature steam control in boiler and turbine systems",
          "Rapid-response ESD valves for turbine trip protection",
          "Long-service-life components in continuous duty cycles",
          "Tight shutoff requirements for fuel and condensate lines",
        ],
        solutions: [
          "High-temperature solenoid valves for steam and condensate service",
          "Fast-acting ESD actuators for turbine protection systems",
          "Long-life design rated for millions of cycles",
          "Full SIL-compliant solutions for safety-critical loops",
        ],
        recommendedProducts: ["Solenoid Valve", "Actuators", "Positioners"],
        customerStories: [
          { image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=640&q=80", quote: "Rotex ESD actuators respond within milliseconds on turbine trip. In thermal power, that speed is the difference between a controlled shutdown and a catastrophe.", author: "Arun Joshi", company: "Turbine Engineer, NTPC" },
          { image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=640&q=80", quote: "We've been running Rotex steam solenoid valves on our boiler feed systems for over three years. Not a single unplanned outage attributable to the valves.", author: "Kavita Menon", company: "Plant Operations Lead, Adani Power" },
          { image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=640&q=80", quote: "The SIL compliance package was thorough and accepted by our third-party safety assessor without revision. Saved us significant time during certification.", author: "Harish Rao", company: "Safety Engineer, Tata Power" },
          { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&q=80", quote: "Rotex offered the widest operating temperature range we found for steam service. That headroom gives us confidence across seasonal load variations.", author: "Sunita Patil", company: "Instrumentation Manager, CESC" },
        ],
      },
      {
        slug: "nuclear",
        name: "Nuclear Power",
        description: "Nuclear power plants require the highest levels of safety certification and fail-safe reliability for reactor coolant, containment, and emergency shutdown systems.",
        challengesTitle: "Challenges in Nuclear Power",
        solutionsTitle: "Rotex Solutions for Nuclear Power",
        solutionsIntro: "Rotex provides safety-certified flow control engineered for nuclear power environments:",
        challenges: ["Nuclear-grade safety certification and qualification requirements", "Fail-safe performance in reactor coolant and containment systems", "Reliable emergency shutdown valve activation", "Long-term reliability under radiation and thermal stress"],
        solutions: ["Safety-certified solenoid and actuated valves for nuclear duty", "Fail-safe designs for coolant and containment isolation systems", "Fast-acting ESD valves for emergency shutdown sequences", "Materials qualified for radiation and thermal stress environments"],
        recommendedProducts: ["Solenoid Valve", "Actuators", "Positioners"],
        customerStories: [],
      },
    ],
  },
  {
    slug: "automotive",
    name: "Automotive",
    bgKey: "automative",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
    description:
      "Precision flow control built for the fast-paced demands of automotive manufacturing — from paint booths to powertrain assembly lines.",
    sectionTitle: "Powering Automotive Manufacturing",
    overview:
      "Automotive manufacturing requires split-second precision and zero tolerance for deviation. From paint shop humidity control to powertrain assembly pneumatics, Rotex solenoid valves and actuators deliver consistent, repeatable performance. Our solutions integrate seamlessly into robotic assembly lines, test rigs, and clean rooms — keeping production moving without interruption.",
    stats: [
      { value: "500", suffix: "+", label: "OEM Installations" },
      { value: "57", suffix: "+", label: "Years of Reliability" },
    ],
    whyChoose: {
      title: "Why Choose Rotex for",
      highlight: "Automotive",
      cards: [
        { title: "Line-Speed Precision", description: "Millisecond-accurate valve response keeps pace with high-speed robotic assembly lines." },
        { title: "OEM Integration Ready", description: "Compact form factors and standard interfaces for seamless machine builder integration." },
        { title: "Consistent Repeatability", description: "Zero-drift performance across millions of cycles for defect-free manufacturing." },
        { title: "Clean Environment Compatible", description: "Low-emission and clean-room compatible valve designs for paint and trim operations." },
      ],
    },
    subIndustries: [],
  },
  {
    slug: "rail",
    name: "Rail",
    bgKey: "rail",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80",
    description:
      "Robust valve solutions designed for the rigorous safety and reliability standards of rail traction, braking, and pneumatic control systems.",
    sectionTitle: "Dependable Flow Control for Rail Systems",
    overview:
      "Rail systems demand the highest levels of safety and reliability. From pneumatic braking to HVAC and door control, Rotex valves are engineered to perform across thousands of cycles without failure. Our rail-grade components meet international railway standards and are trusted by rolling stock manufacturers and rail operators worldwide.",
    stats: [
      { value: "200", suffix: "+", label: "Rail Projects" },
      { value: "57", suffix: "+", label: "Years of Reliability" },
    ],
    whyChoose: {
      title: "Why Choose Rotex for",
      highlight: "Rail",
      cards: [
        { title: "Safety-First Engineering", description: "All rail-grade components meet EN 50155 and relevant railway safety standards as standard." },
        { title: "Vibration Resistance", description: "Designed and tested to withstand the constant shock and vibration of rolling stock operation." },
        { title: "Wide Temperature Range", description: "Reliable performance from -40°C to +85°C for all climate zones and operating conditions." },
        { title: "Compact & Lightweight", description: "Space-optimised designs to meet the tight installation constraints of rail vehicles." },
      ],
    },
    subIndustries: [],
  },
  {
    slug: "aerospace",
    name: "Aerospace & Defence",
    bgKey: "aerospace",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1200&q=80",
    description:
      "Ultra-precise, lightweight flow control for aerospace ground support, fuel handling, and hydraulic test rigs where failure is not an option.",
    sectionTitle: "Precision Flow Control for Aerospace",
    overview:
      "Aerospace applications leave no room for error. Ground support equipment, fuel handling systems, and hydraulic test rigs require valves that are precise, lightweight, and absolutely reliable. Rotex delivers aerospace-grade flow control solutions engineered to meet the stringent traceability and performance requirements of aviation and defence applications.",
    stats: [
      { value: "100", suffix: "+", label: "Aerospace Clients" },
      { value: "57", suffix: "+", label: "Years of Reliability" },
    ],
    whyChoose: {
      title: "Why Choose Rotex for",
      highlight: "Aerospace",
      cards: [
        { title: "Traceability & Documentation", description: "Full material traceability and test documentation for every component supplied to aerospace clients." },
        { title: "Lightweight Design", description: "Optimised material selection minimises weight without compromising structural or functional integrity." },
        { title: "Zero-Leak Performance", description: "Class VI shutoff ensures zero contamination in fuel, hydraulic, and pneumatic systems." },
        { title: "Custom Engineering", description: "Application-specific solutions engineered to meet unique aerospace performance requirements." },
      ],
    },
    subIndustries: [],
  },
  {
    slug: "process",
    name: "Process Industries",
    bgKey: "process",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80",
    description:
      "Precision flow control for the diverse, continuous, and often aggressive processes that define fertilizer, chemical, cement, food, paper, pharma, paint, textile, water, mining, and tyre manufacturing.",
    sectionTitle: "Engineered Flow Control Across Process Industries",
    overview:
      "Process industries span an enormous range of media, pressures, and regulatory regimes — from corrosive fertilizer slurries to sterile pharmaceutical lines to abrasive cement dust. What they share is zero tolerance for unplanned downtime and a constant need for repeatable, certified performance. Rotex solenoid valves, angle seat valves, actuators, and positioners are engineered and material-matched to each process environment, giving plant engineers a single trusted supplier across their entire process portfolio.",
    stats: [
      { value: "11", label: "Process Sectors Served" },
      { value: "57", suffix: "+", label: "Years of Reliability" },
    ],
    whyChoose: {
      title: "Why Choose Rotex for",
      highlight: "Process Industries",
      cards: [
        { title: "Material-Matched Engineering", description: "Valve bodies, seals, and trims selected per media — corrosive, abrasive, hygienic, or high-purity." },
        { title: "Broad Certification Coverage", description: "ATEX, IECEx, FDA, and hygienic design options to meet sector-specific compliance." },
        { title: "Single-Supplier Simplicity", description: "One engineering partner across every process line in your plant, cutting vendor overhead." },
        { title: "Field-Proven Across Sectors", description: "Decades of deployment across fertilizer, chemical, cement, food, and pharma plants." },
      ],
    },
    subIndustries: [
      {
        slug: "fertilizer",
        name: "Fertilizer",
        description: "Fertilizer production handles corrosive ammonia, urea, and phosphate media under high pressure — demanding valves that resist chemical attack while holding tight shutoff.",
        challengesTitle: "Challenges in Fertilizer Production",
        solutionsTitle: "Rotex Solutions for Fertilizer Plants",
        solutionsIntro: "Rotex delivers corrosion-resistant flow control engineered for fertilizer process lines:",
        challenges: ["Handling highly corrosive ammonia, urea, and phosphate media", "High-pressure dosing accuracy in granulation and reaction stages", "Reliable shutoff under continuous exposure to aggressive chemicals", "Meeting hazardous-area compliance across the plant"],
        solutions: ["Corrosion-resistant valve bodies and coated trims for ammonia/urea service", "High-pressure rated actuated valves for dosing and reaction control", "Tight-shutoff seat designs for continuous chemical exposure", "ATEX/IECEx-certified components for hazardous zones"],
        recommendedProducts: ["Solenoid Valve", "Angle Seat Valve", "Actuators"],
        customerStories: [],
      },
      {
        slug: "chemicals",
        name: "Chemicals",
        description: "Chemical processing spans thousands of media types and reaction conditions, requiring valve solutions engineered for chemical compatibility, precise dosing, and fail-safe operation.",
        challengesTitle: "Challenges in Chemical Processing",
        solutionsTitle: "Rotex Solutions for Chemical Plants",
        solutionsIntro: "Rotex provides chemically compatible, fail-safe flow control for chemical process plants:",
        challenges: ["Wide range of aggressive and reactive media compatibility", "Precise dosing control for reaction and batch processes", "Fail-safe operation in hazardous chemical environments", "Long service life despite continuous chemical exposure"],
        solutions: ["Wide seal and trim material range for chemical compatibility", "Proportional and positioner-controlled valves for precise dosing", "Fail-safe fail-close/fail-open configurations as standard", "Long-life designs validated for continuous chemical duty"],
        recommendedProducts: ["Solenoid Valve", "Actuators", "Positioners"],
        customerStories: [],
      },
      {
        slug: "cement",
        name: "Cement",
        description: "Cement manufacturing exposes equipment to extreme dust, heat, and abrasive material handling — requiring rugged, low-maintenance valve solutions.",
        challengesTitle: "Challenges in Cement Manufacturing",
        solutionsTitle: "Rotex Solutions for Cement Plants",
        solutionsIntro: "Rotex delivers rugged flow control built for cement plant conditions:",
        challenges: ["Heavy dust ingress affecting valve and actuator reliability", "High-temperature performance near kiln and clinker cooling zones", "Abrasive material handling reducing component service life", "Continuous-duty operation with minimal maintenance access"],
        solutions: ["Dust-sealed valve and actuator enclosures for kiln-area installation", "High-temperature rated components for clinker cooling zones", "Wear-resistant trims for abrasive pneumatic conveying lines", "Low-maintenance designs suited to continuous cement plant duty"],
        recommendedProducts: ["Solenoid Valve", "Actuators"],
        customerStories: [],
      },
      {
        slug: "food-beverages",
        name: "Food & Beverages",
        description: "Food and beverage production demands hygienic, CIP-compatible valve designs that meet strict food-safety standards without compromising line speed.",
        challengesTitle: "Challenges in Food & Beverage Production",
        solutionsTitle: "Rotex Solutions for Food & Beverage Plants",
        solutionsIntro: "Rotex provides hygienic, certified flow control for food and beverage lines:",
        challenges: ["Hygienic, CIP/SIP-compatible design requirements", "Food-grade material certification across all wetted parts", "Fast-cycle performance for high-speed filling and packaging lines", "Preventing product contamination at every valve interface"],
        solutions: ["Stainless steel hygienic valve bodies for food-contact service", "FDA/EC1935-compliant seal materials", "High-cycle solenoid valves rated for fast-fill production lines", "CIP/SIP-compatible designs for automated cleaning cycles"],
        recommendedProducts: ["Solenoid Valve", "Angle Seat Valve"],
        customerStories: [],
      },
      {
        slug: "paper-pulp",
        name: "Paper & Pulp",
        description: "Paper and pulp mills run continuous, high-moisture processes handling pulp stock, chemicals, and steam — requiring valves resistant to fouling and corrosion.",
        challengesTitle: "Challenges in Paper & Pulp Manufacturing",
        solutionsTitle: "Rotex Solutions for Paper & Pulp Mills",
        solutionsIntro: "Rotex delivers fouling- and corrosion-resistant flow control for pulp and paper mills:",
        challenges: ["Fouling from pulp stock and fibre build-up in valve bodies", "Corrosive bleaching chemical exposure across the process", "Continuous steam and hot water control for drying sections", "High-uptime requirements in 24/7 mill operations"],
        solutions: ["Full-bore, self-cleaning valve designs resistant to fibre fouling", "Corrosion-resistant materials for bleach plant chemical service", "High-temperature steam valves for drying and press sections", "Long-life components engineered for continuous mill operation"],
        recommendedProducts: ["Solenoid Valve", "Actuators", "Angle Seat Valve"],
        customerStories: [],
      },
      {
        slug: "pharmaceuticals",
        name: "Pharmaceuticals",
        description: "Pharmaceutical manufacturing requires ultra-hygienic, traceable, and precisely controlled flow solutions to meet GMP and regulatory validation requirements.",
        challengesTitle: "Challenges in Pharmaceutical Manufacturing",
        solutionsTitle: "Rotex Solutions for Pharmaceutical Plants",
        solutionsIntro: "Rotex provides GMP-compliant, traceable flow control for pharmaceutical production:",
        challenges: ["GMP compliance and full material traceability requirements", "Ultra-hygienic, contamination-free valve design", "Precise dosing control for active ingredient and solvent handling", "Validation documentation required for regulatory audits"],
        solutions: ["Pharma-grade stainless steel valve bodies with full traceability", "Hygienic, dead-leg-free design for contamination-free service", "Proportional valves for precise API and solvent dosing", "Complete validation and material certification documentation"],
        recommendedProducts: ["Solenoid Valve", "Positioners", "Actuators"],
        customerStories: [],
      },
      {
        slug: "paints",
        name: "Paints",
        description: "Paint and coatings manufacturing handles flammable solvents and viscous media, requiring explosion-proof, precisely controlled valve solutions.",
        challengesTitle: "Challenges in Paint Manufacturing",
        solutionsTitle: "Rotex Solutions for Paint Plants",
        solutionsIntro: "Rotex delivers explosion-proof, precision flow control for paint and coatings production:",
        challenges: ["Explosion-proof requirements for flammable solvent handling", "Viscous media control across mixing and filling stages", "Consistent batch quality through precise dosing", "Cross-contamination prevention between colour batches"],
        solutions: ["ATEX-certified solenoid valves for solvent-laden atmospheres", "Proportional valves engineered for viscous media control", "Precision dosing valves for consistent batch quality", "Easy-clean valve designs to prevent colour cross-contamination"],
        recommendedProducts: ["Solenoid Valve", "Angle Seat Valve"],
        customerStories: [],
      },
      {
        slug: "textiles",
        name: "Textiles",
        description: "Textile processing runs continuous dyeing, finishing, and steam operations that demand reliable, chemical-resistant valve control across long production runs.",
        challengesTitle: "Challenges in Textile Processing",
        solutionsTitle: "Rotex Solutions for Textile Plants",
        solutionsIntro: "Rotex provides reliable flow control engineered for textile dyeing and finishing lines:",
        challenges: ["Chemical and dye-bath resistant valve performance", "High-temperature steam control in finishing operations", "Continuous-duty reliability across long production runs", "Precise dosing for consistent dye-batch quality"],
        solutions: ["Chemical-resistant trims for dye-bath and finishing chemical service", "High-temperature steam valves for finishing and drying stages", "Long-life components rated for continuous textile line duty", "Proportional dosing valves for consistent batch-to-batch quality"],
        recommendedProducts: ["Solenoid Valve", "Actuators"],
        customerStories: [],
      },
      {
        slug: "water-management",
        name: "Water Management",
        description: "Water and wastewater management requires dependable, low-maintenance valve solutions for treatment, distribution, and effluent control across municipal and industrial systems.",
        challengesTitle: "Challenges in Water Management",
        solutionsTitle: "Rotex Solutions for Water Management",
        solutionsIntro: "Rotex delivers dependable flow control for water and wastewater systems:",
        challenges: ["Reliable long-term performance in treatment and distribution networks", "Corrosion resistance in raw and treated water service", "Remote operability across distributed treatment sites", "Low-maintenance performance to reduce operational cost"],
        solutions: ["Corrosion-resistant valve bodies for water and effluent service", "Remote-operable actuated valves for distributed sites", "Low-maintenance designs for long-term treatment plant duty", "Reliable dosing valves for chemical treatment stages"],
        recommendedProducts: ["Solenoid Valve", "Actuators", "Angle Seat Valve"],
        customerStories: [],
      },
      {
        slug: "metal-mining",
        name: "Metal & Mining",
        description: "Metal and mining operations run abrasive, high-load processes in harsh environments, demanding rugged valve solutions built to withstand continuous heavy-duty use.",
        challengesTitle: "Challenges in Metal & Mining Operations",
        solutionsTitle: "Rotex Solutions for Metal & Mining",
        solutionsIntro: "Rotex provides rugged, heavy-duty flow control for metal and mining operations:",
        challenges: ["Abrasive slurry and particulate handling reducing component life", "Harsh outdoor and underground operating environments", "Heavy-duty, continuous operation with limited maintenance access", "Reliable performance across extreme temperature swings"],
        solutions: ["Wear-resistant trims for abrasive slurry and particulate service", "Rugged, sealed enclosures for harsh site environments", "Low-maintenance designs for continuous heavy-duty operation", "Wide temperature range components for extreme site conditions"],
        recommendedProducts: ["Solenoid Valve", "Actuators"],
        customerStories: [],
      },
      {
        slug: "tyre",
        name: "Tyre",
        description: "Tyre manufacturing depends on precise pneumatic and hydraulic control across mixing, extrusion, and curing stages to deliver consistent product quality.",
        challengesTitle: "Challenges in Tyre Manufacturing",
        solutionsTitle: "Rotex Solutions for Tyre Plants",
        solutionsIntro: "Rotex delivers precise flow control engineered for tyre manufacturing processes:",
        challenges: ["Precise pressure control across mixing, extrusion, and curing", "High-cycle valve performance in continuous production", "Consistent product quality across every curing cycle", "Reliable operation in heat- and rubber-particulate environments"],
        solutions: ["High-cycle solenoid valves for extrusion and curing press control", "Precision proportional valves for consistent curing pressure", "Rugged components rated for heat and particulate exposure", "Long-service-life designs for continuous tyre production lines"],
        recommendedProducts: ["Solenoid Valve", "Actuators", "Positioners"],
        customerStories: [],
      },
    ],
  },
  {
    slug: "machine-solutions",
    name: "Machine Solutions",
    bgKey: "machine",
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200&q=80",
    description:
      "Purpose-built flow control systems for specialised machine applications, including fire fighting and safety-critical fluid systems.",
    sectionTitle: "Purpose-Built Flow Control for Machine Solutions",
    overview:
      "Specialised machine applications — from fire fighting systems to custom fluid-handling equipment — demand flow control that is engineered for the specific duty, not adapted from a generic catalogue. Rotex works directly with machine builders and system integrators to deliver valve and actuator solutions matched exactly to the application's pressure, media, and response-time requirements.",
    stats: [
      { value: "1", label: "Specialised Application" },
      { value: "57", suffix: "+", label: "Years of Reliability" },
    ],
    whyChoose: {
      title: "Why Choose Rotex for",
      highlight: "Machine Solutions",
      cards: [
        { title: "Application-Specific Engineering", description: "Solutions engineered to the exact duty cycle, pressure, and media of the target machine." },
        { title: "Rapid Response Design", description: "Fast-acting valves for safety-critical and time-sensitive machine operations." },
        { title: "Integration Support", description: "Direct engineering collaboration with machine builders from spec to commissioning." },
      ],
    },
    subIndustries: [
      {
        slug: "fire-fighting",
        name: "Fire Fighting System",
        description: "Fire fighting systems require instant, fail-safe valve activation to deliver water or suppressant the moment a threat is detected — with zero tolerance for delayed or failed response.",
        challengesTitle: "Challenges in Fire Fighting Systems",
        solutionsTitle: "Rotex Solutions for Fire Fighting Systems",
        solutionsIntro: "Rotex delivers fail-safe, rapid-response flow control for fire suppression systems:",
        challenges: ["Instant, reliable activation on fire detection signal", "Fail-safe operation to guarantee suppressant delivery", "Long-term reliability despite infrequent activation", "Compliance with fire safety and suppression system standards"],
        solutions: ["Fast-acting solenoid valves for immediate suppressant release", "Fail-safe fail-open configurations for guaranteed activation", "Corrosion-resistant components rated for long standby service", "Certified components meeting fire suppression system standards"],
        recommendedProducts: ["Solenoid Valve", "Actuators"],
        customerStories: [],
      },
    ],
  },
];

async function main() {
  for (const industry of INDUSTRIES) {
    const { subIndustries, ...industryFields } = industry;

    const industryRow = await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: industryFields,
      create: industryFields,
    });

    for (const sub of subIndustries) {
      const { customerStories, ...subFields } = sub;

      const storyIds: string[] = [];
      for (const story of customerStories) {
        const created = await prisma.customerStory.create({ data: story });
        storyIds.push(created.id);
      }

      await prisma.subIndustry.upsert({
        where: { industryId_slug: { industryId: industryRow.id, slug: sub.slug } },
        update: { ...subFields, storyIds },
        create: { ...subFields, storyIds, industryId: industryRow.id },
      });
    }
  }

  console.log(`Seeded ${INDUSTRIES.length} industries with sub-industries and customer stories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
