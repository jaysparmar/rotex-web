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
  industries: string[];
  categoryName: string;
  modelNo: string;
};

const PLACEHOLDER_IMAGE = "/file.svg";
const KNOWN_FILE_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "png", "jpg", "jpeg", "svg", "csv", "txt"]);

export function fileTypeFromUrl(url: string): string {
  const ext = url.split("?")[0].split("/").pop()?.split(".").pop()?.toLowerCase();
  return ext && KNOWN_FILE_EXTENSIONS.has(ext) ? ext.toUpperCase() : "";
}

export type ProductForDownloads = {
  id: string;
  name: string;
  image: string | null;
  downloads: unknown;
  modelNumber: string;
  category: { name: string } | null;
  subCategory: { name: string } | null;
  industries: { name: string }[];
};

export type VariantForDownloads = {
  id: string;
  downloads: unknown;
  industries: { name: string }[];
  product: {
    name: string;
    image: string | null;
    modelNumber: string;
    category: { name: string } | null;
    subCategory: { name: string } | null;
  };
};

type RawDownloadEntry = { title: string; url: string; tab?: string; categoryId: string };

export function flattenDownloadItems({
  products,
  variants,
  downloadCategories,
}: {
  products: ProductForDownloads[];
  variants: VariantForDownloads[];
  downloadCategories: { id: string; name: string }[];
}): DownloadItem[] {
  const categoryNameById = new Map(downloadCategories.map((c) => [c.id, c.name]));
  const defaultTab: DownloadTab = DOWNLOAD_TABS[0].id;

  const fromProducts: DownloadItem[] = products.flatMap((p) =>
    ((p.downloads as RawDownloadEntry[] | null) ?? [])
      .filter((d) => d.url)
      .map((d, i) => ({
        id: `product-${p.id}-${i}`,
        tab: (d.tab as DownloadTab) ?? defaultTab,
        title: d.title,
        language: "English",
        fileType: fileTypeFromUrl(d.url),
        fileSizeLabel: "",
        fileUrl: d.url,
        image: p.image ?? PLACEHOLDER_IMAGE,
        product: p.category?.name ?? "",
        subCategory: p.subCategory?.name ?? "",
        industries: p.industries.map((i) => i.name),
        categoryName: categoryNameById.get(d.categoryId) ?? "",
        modelNo: p.modelNumber ?? "",
      }))
  );

  const fromVariants: DownloadItem[] = variants.flatMap((v) =>
    ((v.downloads as RawDownloadEntry[] | null) ?? [])
      .filter((d) => d.url)
      .map((d, i) => ({
        id: `variant-${v.id}-${i}`,
        tab: (d.tab as DownloadTab) ?? defaultTab,
        title: d.title,
        language: "English",
        fileType: fileTypeFromUrl(d.url),
        fileSizeLabel: "",
        fileUrl: d.url,
        image: v.product.image ?? PLACEHOLDER_IMAGE,
        product: v.product.category?.name ?? "",
        subCategory: v.product.subCategory?.name ?? "",
        industries: v.industries.map((i) => i.name),
        categoryName: categoryNameById.get(d.categoryId) ?? "",
        modelNo: v.product.modelNumber ?? "",
      }))
  );

  return [...fromProducts, ...fromVariants];
}
