import { DownloadsHeroSection } from "@/components/sections/downloads-hero-section";
import { DownloadsSection } from "@/components/sections/downloads-section";
import { prisma } from "@/lib/prisma";
import type { DownloadItem, DownloadTab } from "@/lib/downloads-data";
import { DOWNLOAD_TABS } from "@/lib/downloads-data";

const DEFAULT_TAB: DownloadTab = DOWNLOAD_TABS[0].id;
const PLACEHOLDER_IMAGE = "/file.svg";

function fileTypeFromUrl(url: string): string {
  const ext = url.split("?")[0].split(".").pop();
  return ext ? ext.toUpperCase() : "PDF";
}

export default async function DownloadsPage() {
  const [products, variants, industries] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        downloads: true,
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
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
            industry: { select: { name: true } },
          },
        },
      },
    }),
    prisma.industry.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);

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
