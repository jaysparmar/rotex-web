export type DownloadTab = "certificates" | "instruction-manual" | "product-brochure" | "corporate-catalogue" | "performance-certificates";

export const DOWNLOAD_TABS: { id: DownloadTab; label: string }[] = [
  { id: "certificates", label: "Certificates" },
  { id: "instruction-manual", label: "Instruction Manual" },
  { id: "product-brochure", label: "Product Brochure" },
  { id: "corporate-catalogue", label: "Corporate Catalogue" },
  { id: "performance-certificates", label: "Performance Certificates" },
];

export type DownloadItem = {
  id: string;
  tab: DownloadTab;
  title: string;
  language: string;
  fileType: string;
  fileSizeLabel: string;
  fileUrl: string;
  image: string;
  product: string;
  subCategory: string;
  productCertificateType: string;
  qmsCertificateType: string;
  industry: string;
};
