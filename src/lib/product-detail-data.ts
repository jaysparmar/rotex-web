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
  images: StaticImageData[];
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

function actuatorProduct(): ProductDetail {
  return {
    slug: "pneumatic-scotch-yoke-actuator-20101",
    code: "20101",
    name: "Pneumatic Scotch Yoke Actuator",
    category: "Actuators",
    tags: ["Quarter Turn", "Double Acting"],
    description:
      "The Pneumatic Scotch Yoke Actuator delivers high torque output for quarter-turn valve automation in demanding field conditions.",
    industriesServed: INDUSTRIES,
    certificates: CERTS,
    images: [product3, product4, product1],
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Oil & Gas", href: "/industries/oil-gas" },
      { label: "Upstream", href: "/industries/oil-gas/upstream" },
      { label: "Actuators", href: "/products?category=Actuators" },
      { label: "Pneumatic Scotch Yoke Actuator" },
    ],
    productType: "simple",
    features:
      "Rack-and-pinion-free scotch yoke design delivers a torque curve matched to butterfly and ball valve requirements, with a compact footprint and corrosion-resistant housing.",
    specifications: [
      { key: "Torque Output", value: "Up to 4,500 Nm" },
      { key: "Action", value: "Double Acting / Spring Return" },
      { key: "Housing Material", value: "Aluminium Alloy, Epoxy Coated" },
      { key: "Ambient Temperature", value: "-20°C to +80°C" },
    ],
    downloads: DOWNLOADS,
  };
}

function angleSeatProduct(): ProductDetail {
  return {
    slug: "angle-seat-valve-20201",
    code: "20201",
    name: "Angle Seat Valve",
    category: "Angle Seat Valve",
    tags: ["2 Way", "Normally Open"],
    description:
      "The Angle Seat Valve combines a pneumatic actuator with a piston-guided valve body for long service life in aggressive process media.",
    industriesServed: INDUSTRIES,
    certificates: CERTS,
    images: [product4, product1, product2],
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Oil & Gas", href: "/industries/oil-gas" },
      { label: "Upstream", href: "/industries/oil-gas/upstream" },
      { label: "Angle Seat Valve", href: "/products?category=Angle+Seat+Valve" },
      { label: "Angle Seat Valve" },
    ],
    productType: "simple",
    features:
      "Piston-actuated angle seat design minimizes turbulence and pressure drop while withstanding high cycle rates in steam, water, and aggressive chemical service.",
    specifications: [
      { key: "Body Material", value: "Stainless Steel 316" },
      { key: "Actuation", value: "Pneumatic, 5.5-8 bar" },
      { key: "Max. Working Pressure", value: "16 bar" },
      { key: "Ambient Temperature", value: "-10°C to +140°C" },
    ],
    downloads: DOWNLOADS,
  };
}

const SOLENOID_CODES = ["20101", "20102", "20103", "20104", "20105", "20106", "20107", "20108", "20109", "20110"];

export const ALL_PRODUCT_DETAILS: ProductDetail[] = [
  actuatorProduct(),
  ...SOLENOID_CODES.map((code) => solenoidProduct(`direct-acting-solenoid-valve-${code}`, code)),
  angleSeatProduct(),
];

export function getProductDetail(slug: string): ProductDetail | undefined {
  return ALL_PRODUCT_DETAILS.find((p) => p.slug === slug);
}
