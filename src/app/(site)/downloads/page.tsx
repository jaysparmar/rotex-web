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
  const [curatedItems, products, variants] = await Promise.all([
    prisma.downloadItem.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }),
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
  ]);

  const curated: DownloadItem[] = curatedItems.map((r) => ({
    id: r.id,
    tab: r.tab as DownloadTab,
    title: r.title,
    language: r.language,
    fileType: r.fileType,
    fileSizeLabel: r.fileSizeLabel,
    fileUrl: r.fileUrl,
    image: r.image,
    product: r.product,
    subCategory: r.subCategory,
    productCertificateType: r.productCertificateType,
    qmsCertificateType: r.qmsCertificateType,
    industry: r.industry,
  }));

  const fromProducts: DownloadItem[] = products.flatMap((p) =>
    (p.downloads ?? [])
      .filter((d) => d.showOnDownloadsPage && d.url)
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
        productCertificateType: "",
        qmsCertificateType: "",
        industry: p.industry?.name ?? "",
      }))
  );

  const fromVariants: DownloadItem[] = variants.flatMap((v) =>
    (v.downloads ?? [])
      .filter((d) => d.showOnDownloadsPage && d.url)
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
        productCertificateType: "",
        qmsCertificateType: "",
        industry: v.product.industry?.name ?? "",
      }))
  );

  const items = [...curated, ...fromProducts, ...fromVariants];

  return (
    <div>
      <DownloadsHeroSection />
      <DownloadsSection items={items} />
    </div>
  );
}
