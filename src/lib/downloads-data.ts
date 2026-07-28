export type DownloadTab = "certificates" | "instruction-manual" | "product-brochure" | "corporate-catalogue" | "performance-certificates";

export const DOWNLOAD_TABS: { id: DownloadTab; label: string }[] = [
  { id: "certificates", label: "Certificates" },
  { id: "instruction-manual", label: "Instruction Manual" },
  { id: "product-brochure", label: "Product Brochure" },
  { id: "corporate-catalogue", label: "Corporate Catalogue" },
  { id: "performance-certificates", label: "Performance Certificates" },
];

export const PRODUCT_OPTIONS = ["Solenoid Valve", "Angle Seat Valve", "Actuators", "Positioners", "Automotive Solutions"];
export const SUB_CATEGORY_OPTIONS = ["2/2 Way", "3/2 Way", "5/2 Way", "Direct Acting", "Pilot Operated"];
export const PRODUCT_CERTIFICATE_OPTIONS = ["CE Certificate", "ATEX Certificate", "IECEx Certificate"];
export const QMS_CERTIFICATE_OPTIONS = ["ISO 9001", "ISO 14001", "IATF 16949"];
export const INDUSTRY_OPTIONS = ["Oil & Gas", "Process", "Power", "Rail", "Machine Solutions", "Aerospace & Defense", "Automotive"];

export type DownloadItem = {
  id: string;
  tab: DownloadTab;
  title: string;
  meta: string;
  image: string;
};

const IMG = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80";

export const DOWNLOAD_ITEMS: DownloadItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `cert-${i + 1}`,
  tab: "certificates",
  title: i % 3 === 0 ? "Solenoid Valve Brochure" : "Rotex Corporate Brochure 2025",
  meta: "English | .pdf | 1.28 MB",
  image: IMG,
}));
