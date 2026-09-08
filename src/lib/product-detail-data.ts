import type { StaticImageData } from "next/image";
import product1 from "@/assets/Images/products/product_1.png";
import product2 from "@/assets/Images/products/product_2.png";
import product3 from "@/assets/Images/products/product_3.png";
import product4 from "@/assets/Images/products/product_4.png";

// ── Types ────────────────────────────────────────────────────────────────────

export type Crumb = { label: string; href?: string };
export type SpecItem = { key: string; value: string };
export type DownloadItem = { category: string; title: string; url: string };

export type VariantAxisKey = "size" | "variantType" | "orifice" | "minPressure" | "maxPressure" | "flowFactor";

export type ProductVariant = {
  id: string;
  size: string;
  variantType: string;
  orifice: string;
  minPressure: string;
  maxPressure: string;
  flowFactor: string;
  certificates: string[];
  features: string;
  specifications: SpecItem[];
  downloads: DownloadItem[];
};

export type ProductDetail = {
  slug: string;
  code: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  industriesServed: string[];
  certificates: string[];
  images: (StaticImageData | string)[];
  breadcrumb: Crumb[];
  productType: "simple" | "variable";
  // simple products only
  features?: string;
  specifications?: SpecItem[];
  downloads?: DownloadItem[];
  // variable products only
  variants?: ProductVariant[];
};

export const VARIANT_AXES: { key: VariantAxisKey; label: string }[] = [
  { key: "size", label: "Size" },
  { key: "variantType", label: "Type" },
  { key: "orifice", label: "Orifice (mm)" },
  { key: "minPressure", label: "Min. Operating Pressure" },
  { key: "maxPressure", label: "Max. Operating Pressure" },
  { key: "flowFactor", label: "Flow Factor" },
];

// ── Shared mock content ───────────────────────────────────────────────────────

const INDUSTRIES = ["Oil & Gas", "Pharma", "Chemical", "Power", "Petrochemical"];
const CERTS = ["ATEX", "CCOE/PESO", "CUTR-EAC", "IEC EX", "INMETRO", "UKRAIN", "CE", "UL"];

const DOWNLOADS: DownloadItem[] = [
  { category: "Certificate", title: "ATEx", url: "#" },
  { category: "Article", title: "Choosing the Right Communication Protocol", url: "#" },
  {
    category: "Article",
    title: "Improving Plant Operations with Control Valve Simulations (Hydrocarbon Processing, March 2020)",
    url: "#",
  },
  { category: "Article", title: "Leveraging Smart Valve Positioners", url: "#" },
  { category: "Article", title: "The Future of Renewable Energy", url: "#" },
  { category: "Article", title: "Understanding IoT in Manufacturing", url: "#" },
];

const SOLENOID_VARIANTS: ProductVariant[] = [
  {
    id: "v1",
    size: '1/8"',
    variantType: "Female BSP/ NPT Threads",
    orifice: "0.8",
    minPressure: "0",
    maxPressure: "2.5",
    flowFactor: "8",
    certificates: CERTS,
    features: "Compact direct-acting construction with fast response time, suited for low-flow instrumentation duty.",
    specifications: [
      { key: "Body Material", value: "Brass" },
      { key: "Seal Material", value: "NBR" },
      { key: "Coil Voltage", value: "24V DC / 230V AC" },
      { key: "Ambient Temperature", value: "-10°C to +60°C" },
    ],
    downloads: DOWNLOADS,
  },
  {
    id: "v2",
    size: '1/4"',
    variantType: "Female BSP/ NPT Threads",
    orifice: "1.2",
    minPressure: "0",
    maxPressure: "4",
    flowFactor: "7",
    certificates: CERTS,
    features: "Mid-range orifice for general purpose on/off duty in process skids.",
    specifications: [
      { key: "Body Material", value: "Brass" },
      { key: "Seal Material", value: "FKM" },
      { key: "Coil Voltage", value: "24V DC / 230V AC" },
      { key: "Ambient Temperature", value: "-10°C to +80°C" },
    ],
    downloads: DOWNLOADS,
  },
  {
    id: "v3",
    size: '1/4"',
    variantType: "Female BSP/ NPT Threads",
    orifice: "1.6",
    minPressure: "0",
    maxPressure: "6",
    flowFactor: "5",
    certificates: CERTS,
    features: "Higher flow orifice variant for increased throughput requirements.",
    specifications: [
      { key: "Body Material", value: "Stainless Steel" },
      { key: "Seal Material", value: "FKM" },
      { key: "Coil Voltage", value: "24V DC / 230V AC" },
      { key: "Ambient Temperature", value: "-10°C to +80°C" },
    ],
    downloads: DOWNLOADS,
  },
  {
    id: "v4",
    size: '3/8"',
    variantType: "Female BSP/ NPT Threads",
    orifice: "2.5",
    minPressure: "0",
    maxPressure: "8",
    flowFactor: "3.5",
    certificates: CERTS,
    features: "Larger body variant intended for higher pressure differential applications.",
    specifications: [
      { key: "Body Material", value: "Stainless Steel" },
      { key: "Seal Material", value: "FKM" },
      { key: "Coil Voltage", value: "24V DC / 230V AC" },
      { key: "Ambient Temperature", value: "-10°C to +100°C" },
    ],
    downloads: DOWNLOADS,
  },
];

function solenoidProduct(slug: string, code: string): ProductDetail {
  return {
    slug,
    code,
    name: "Direct Acting Solenoid Valve",
    category: "Solenoid Valve",
    tags: ["2 Way", "Normally Close", "Direct"],
    description:
      "The Direct Acting Solenoid Valve is a robust valve designed for precise control in demanding environments, ensuring reliable performance in critical applications.",
    industriesServed: INDUSTRIES,
    certificates: CERTS,
    images: [product1, product2, product3],
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Oil & Gas", href: "/industries/oil-gas" },
      { label: "Upstream", href: "/industries/oil-gas/upstream" },
      { label: "Solenoid valve", href: "/products?category=Solenoid+Valve" },
      { label: "Direct Acting SOV" },
    ],
    productType: "variable",
    variants: SOLENOID_VARIANTS,
  };
}

// ── Simple (non-variant) product catalog ────────────────────────────────────────
// Each category is a template reused across a range of codes (mirrors how real
// catalogs list many part numbers of the same base product), so every category
// gets a realistic 5-10 product spread.

type CategoryTemplate = {
  baseSlug: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  images: StaticImageData[];
  features: string;
  specifications: SpecItem[];
  codes: string[];
};

function codesFrom(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
}

const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    baseSlug: "pneumatic-scotch-yoke-actuator",
    name: "Pneumatic Scotch Yoke Actuator",
    category: "Actuators",
    tags: ["Quarter Turn", "Double Acting"],
    description:
      "The Pneumatic Scotch Yoke Actuator delivers high torque output for quarter-turn valve automation in demanding field conditions.",
    images: [product3, product4, product1],
    features:
      "Rack-and-pinion-free scotch yoke design delivers a torque curve matched to butterfly and ball valve requirements, with a compact footprint and corrosion-resistant housing.",
    specifications: [
      { key: "Torque Output", value: "Up to 4,500 Nm" },
      { key: "Action", value: "Double Acting / Spring Return" },
      { key: "Housing Material", value: "Aluminium Alloy, Epoxy Coated" },
      { key: "Ambient Temperature", value: "-20°C to +80°C" },
    ],
    codes: codesFrom("2020", 6),
  },
  {
    baseSlug: "angle-seat-valve",
    name: "Angle Seat Valve",
    category: "Angle Seat Valve",
    tags: ["2 Way", "Normally Open"],
    description:
      "The Angle Seat Valve combines a pneumatic actuator with a piston-guided valve body for long service life in aggressive process media.",
    images: [product4, product1, product2],
    features:
      "Piston-actuated angle seat design minimizes turbulence and pressure drop while withstanding high cycle rates in steam, water, and aggressive chemical service.",
    specifications: [
      { key: "Body Material", value: "Stainless Steel 316" },
      { key: "Actuation", value: "Pneumatic, 5.5-8 bar" },
      { key: "Max. Working Pressure", value: "16 bar" },
      { key: "Ambient Temperature", value: "-10°C to +140°C" },
    ],
    codes: codesFrom("2030", 6),
  },
  {
    baseSlug: "ball-valve",
    name: "2-Piece Ball Valve",
    category: "Ball Valve",
    tags: ["Full Bore", "Manual"],
    description:
      "The 2-Piece Ball Valve offers bubble-tight shutoff with low operating torque for on/off isolation duty across process lines.",
    images: [product1, product2, product3],
    features:
      "Full-bore PTFE-seated design minimizes pressure drop and gives reliable bubble-tight shutoff across repeated cycles, with a blowout-proof stem for operator safety.",
    specifications: [
      { key: "Body Material", value: "Stainless Steel 316" },
      { key: "Seat Material", value: "PTFE" },
      { key: "Max. Working Pressure", value: "40 bar" },
      { key: "Ambient Temperature", value: "-20°C to +180°C" },
    ],
    codes: codesFrom("2040", 7),
  },
  {
    baseSlug: "butterfly-valve",
    name: "Wafer Butterfly Valve",
    category: "Butterfly Valve",
    tags: ["Wafer Type", "Lever Operated"],
    description:
      "The Wafer Butterfly Valve delivers compact, lightweight flow control for on/off and throttling duty in large-bore piping.",
    images: [product2, product3, product4],
    features:
      "Concentric disc design paired with a resilient liner gives tight shutoff at low cost, with a compact face-to-face dimension that reduces installation weight and space.",
    specifications: [
      { key: "Body Material", value: "Ductile Iron" },
      { key: "Disc Material", value: "Stainless Steel 316" },
      { key: "Liner Material", value: "EPDM" },
      { key: "Max. Working Pressure", value: "16 bar" },
    ],
    codes: codesFrom("2050", 6),
  },
  {
    baseSlug: "smart-valve-positioner",
    name: "Smart Valve Positioner",
    category: "Positioners",
    tags: ["HART", "Linear & Rotary"],
    description:
      "The Smart Valve Positioner converts a control signal into precise, linkage-less valve position feedback for demanding process loops.",
    images: [product3, product4, product1],
    features:
      "HART-communicating electronics give quick responsiveness to setpoint changes and self-diagnostic health evaluation, reducing exposure to hazardous field environments.",
    specifications: [
      { key: "Input Signal", value: "4-20mA HART" },
      { key: "Action", value: "Direct / Reverse" },
      { key: "Enclosure Rating", value: "IP66 / NEMA 4X" },
      { key: "Ambient Temperature", value: "-40°C to +85°C" },
    ],
    codes: codesFrom("2060", 8),
  },
  {
    baseSlug: "explosion-proof-limit-switch-box",
    name: "Explosion Proof Limit Switch Box",
    category: "Limit Switch Box",
    tags: ["ATEX", "Mechanical"],
    description:
      "The Explosion Proof Limit Switch Box gives rugged, visual and electrical valve position feedback in hazardous industrial environments.",
    images: [product4, product1, product2],
    features:
      "Corrosion-resistant aluminium housing with sealed cable entries withstands vibration and washdown, while the mechanical cam design gives reliable open/close signaling.",
    specifications: [
      { key: "Housing Material", value: "Aluminium Alloy, Epoxy Coated" },
      { key: "Switch Type", value: "2x SPDT Mechanical" },
      { key: "Protection Rating", value: "IP67" },
      { key: "Certification", value: "ATEX / IECEx" },
    ],
    codes: codesFrom("2070", 6),
  },
  {
    baseSlug: "filter-regulator-lubricator",
    name: "Filter Regulator Lubricator Unit",
    category: "FRL Unit",
    tags: ["3-Stage", "Modular"],
    description:
      "The Filter Regulator Lubricator Unit conditions compressed air supply for pneumatic actuators and instrumentation.",
    images: [product1, product3, product2],
    features:
      "Modular 3-stage assembly filters particulate, regulates outlet pressure, and meters lubrication in a single compact block, cutting downstream maintenance.",
    specifications: [
      { key: "Body Material", value: "Die-Cast Aluminium" },
      { key: "Filtration Rating", value: "5 micron" },
      { key: "Port Size", value: '1/4" to 1"' },
      { key: "Max. Inlet Pressure", value: "16 bar" },
    ],
    codes: codesFrom("2080", 6),
  },
  {
    baseSlug: "pressure-reducing-valve",
    name: "Pressure Reducing Valve",
    category: "Pressure Reducing Valve",
    tags: ["Pilot Operated", "Self-Acting"],
    description:
      "The Pressure Reducing Valve maintains a stable downstream pressure regardless of fluctuations in upstream supply or flow demand.",
    images: [product2, product4, product1],
    features:
      "Pilot-operated diaphragm design holds tight downstream pressure control across a wide flow range without external power, simplifying installation.",
    specifications: [
      { key: "Body Material", value: "Stainless Steel 316" },
      { key: "Diaphragm Material", value: "PTFE-Faced EPDM" },
      { key: "Set Pressure Range", value: "0.5-16 bar" },
      { key: "Max. Inlet Pressure", value: "25 bar" },
    ],
    codes: codesFrom("2090", 6),
  },
  {
    baseSlug: "quick-exhaust-valve",
    name: "Quick Exhaust Valve",
    category: "Quick Exhaust Valve",
    tags: ["In-Line", "Fast Response"],
    description:
      "The Quick Exhaust Valve speeds up actuator stroke time by venting exhaust air directly at the cylinder port instead of routing it back through the control line.",
    images: [product3, product1, product4],
    features:
      "Direct at-cylinder exhaust cuts actuator response time significantly, improving cycle rate on double-acting pneumatic actuators without added control logic.",
    specifications: [
      { key: "Body Material", value: "Anodised Aluminium" },
      { key: "Seal Material", value: "NBR" },
      { key: "Port Size", value: '1/8" to 1/2"' },
      { key: "Max. Working Pressure", value: "10 bar" },
    ],
    codes: codesFrom("2100", 6),
  },
  {
    baseSlug: "y-type-strainer",
    name: "Y-Type Strainer",
    category: "Strainer",
    tags: ["Inline", "Cleanable"],
    description:
      "The Y-Type Strainer protects downstream valves and instrumentation by removing particulate from process fluid ahead of critical components.",
    images: [product4, product2, product3],
    features:
      "Removable perforated mesh screen allows quick cleaning without removing the strainer body from the line, minimizing process downtime.",
    specifications: [
      { key: "Body Material", value: "Stainless Steel 316" },
      { key: "Screen Mesh", value: "40 Mesh (Standard)" },
      { key: "Max. Working Pressure", value: "40 bar" },
      { key: "Ambient Temperature", value: "-20°C to +200°C" },
    ],
    codes: codesFrom("2110", 6),
  },
  {
    baseSlug: "automotive-proportional-solenoid-valve",
    name: "Automotive Proportional Solenoid Valve",
    category: "Automotive Solutions",
    tags: ["Proportional", "Low Voltage"],
    description:
      "The Automotive Proportional Solenoid Valve gives continuous, proportional flow control for on-vehicle transmission and suspension systems.",
    images: [product2, product1, product3],
    features:
      "Compact low-voltage coil design gives fast proportional response for transmission shift control and adaptive suspension duty, built to withstand vehicle-grade vibration and thermal cycling.",
    specifications: [
      { key: "Coil Voltage", value: "12V DC" },
      { key: "Response Time", value: "< 15 ms" },
      { key: "Body Material", value: "Anodised Aluminium" },
      { key: "Ambient Temperature", value: "-40°C to +125°C" },
    ],
    codes: codesFrom("2120", 5),
  },
  {
    baseSlug: "automotive-ecu-interface-module",
    name: "Automotive ECU Interface Module",
    category: "Automotive Solutions",
    tags: ["CAN Bus", "Compact"],
    description:
      "The Automotive ECU Interface Module bridges vehicle control units with pneumatic and hydraulic actuation systems over a CAN bus link.",
    images: [product3, product4, product2],
    features:
      "CAN bus connectivity gives direct integration with vehicle ECUs, reducing wiring complexity while giving real-time diagnostic feedback to the driver's cabin.",
    specifications: [
      { key: "Communication", value: "CAN 2.0B" },
      { key: "Supply Voltage", value: "9-32V DC" },
      { key: "Housing Material", value: "Glass-Filled Nylon" },
      { key: "Protection Rating", value: "IP67" },
    ],
    codes: codesFrom("2130", 5),
  },
];

function simpleProductsFromTemplate(template: CategoryTemplate): ProductDetail[] {
  return template.codes.map((code) => ({
    slug: `${template.baseSlug}-${code}`,
    code,
    name: template.name,
    category: template.category,
    tags: template.tags,
    description: template.description,
    industriesServed: INDUSTRIES,
    certificates: CERTS,
    images: template.images,
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Oil & Gas", href: "/industries/oil-gas" },
      { label: "Upstream", href: "/industries/oil-gas/upstream" },
      { label: template.category, href: `/products?category=${encodeURIComponent(template.category)}` },
      { label: template.name },
    ],
    productType: "simple",
    features: template.features,
    specifications: template.specifications,
    downloads: DOWNLOADS,
  }));
}

const SOLENOID_CODES = ["20101", "20102", "20103", "20104", "20105", "20106", "20107", "20108", "20109", "20110"];

export const ALL_PRODUCT_DETAILS: ProductDetail[] = [
  ...CATEGORY_TEMPLATES.flatMap(simpleProductsFromTemplate),
  ...SOLENOID_CODES.map((code) => solenoidProduct(`direct-acting-solenoid-valve-${code}`, code)),
];

export function getProductDetail(slug: string): ProductDetail | undefined {
  return ALL_PRODUCT_DETAILS.find((p) => p.slug === slug);
}
