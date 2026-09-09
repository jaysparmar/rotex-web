import { DownloadsHeroSection } from "@/components/sections/downloads-hero-section";
import { DownloadsSection } from "@/components/sections/downloads-section";
import { prisma } from "@/lib/prisma";
import type { DownloadItem, DownloadTab } from "@/lib/downloads-data";
import { DOWNLOAD_TABS } from "@/lib/downloads-data";

const DEFAULT_TAB: DownloadTab = DOWNLOAD_TABS[0].id;
const PLACEHOLDER_IMAGE = "/file.svg";

const KNOWN_FILE_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "png", "jpg", "jpeg", "svg", "csv", "txt"]);

function fileTypeFromUrl(url: string): string {
  const ext = url.split("?")[0].split("/").pop()?.split(".").pop()?.toLowerCase();
  return ext && KNOWN_FILE_EXTENSIONS.has(ext) ? ext.toUpperCase() : "";
}

export default async function DownloadsPage() {
  const [products, variants, industries, downloadCategories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        downloads: true,
        modelNumber: true,
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        industry: { select: { name: true } },
      },
    }),
    prisma.productVariant.findMany({
      select: {
        id: true,
        downloads: true,
        product: {
          select: {
            name: true,
            image: true,
            modelNumber: true,
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
            industry: { select: { name: true } },
          },
        },
      },
    }),
    prisma.industry.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    prisma.downloadCategory.findMany({ select: { id: true, name: true } }),
  ]);

  const categoryNameById = new Map(downloadCategories.map((c) => [c.id, c.name]));

  const fromProducts: DownloadItem[] = products.flatMap((p) =>
    (p.downloads ?? [])
      .filter((d) => d.url)
      .map((d, i) => ({
        id: `product-${p.id}-${i}`,
        tab: (d.tab as DownloadTab) ?? DEFAULT_TAB,
        title: d.title,
        language: "English",
        fileType: fileTypeFromUrl(d.url),
        fileSizeLabel: "",
        fileUrl: d.url,
        image: p.image ?? PLACEHOLDER_IMAGE,
        product: p.category?.name ?? "",
        subCategory: p.subCategory?.name ?? "",
        industry: p.industry?.name ?? "",
        categoryName: categoryNameById.get(d.categoryId) ?? "",
        modelNo: p.modelNumber ?? "",
      }))
  );

  const fromVariants: DownloadItem[] = variants.flatMap((v) =>
    (v.downloads ?? [])
      .filter((d) => d.url)
      .map((d, i) => ({
        id: `variant-${v.id}-${i}`,
        tab: (d.tab as DownloadTab) ?? DEFAULT_TAB,
        title: d.title,
        language: "English",
        fileType: fileTypeFromUrl(d.url),
        fileSizeLabel: "",
        fileUrl: d.url,
        image: v.product.image ?? PLACEHOLDER_IMAGE,
        product: v.product.category?.name ?? "",
        subCategory: v.product.subCategory?.name ?? "",
        industry: v.product.industry?.name ?? "",
        categoryName: categoryNameById.get(d.categoryId) ?? "",
        modelNo: v.product.modelNumber ?? "",
      }))
  );

  const items = [...fromProducts, ...fromVariants];
  const industryOptions = industries.map((i) => i.name);

  return (
    <div>
      <DownloadsHeroSection />
      <DownloadsSection items={items} industryOptions={industryOptions} />
    </div>
  );
}
