import { DownloadsHeroSection } from "@/components/sections/downloads-hero-section";
import { DownloadsSection } from "@/components/sections/downloads-section";
import { prisma } from "@/lib/prisma";
import type { DownloadTab } from "@/lib/downloads-data";

export default async function DownloadsPage() {
  const records = await prisma.downloadItem.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const items = records.map((r) => ({
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

  return (
    <div>
      <DownloadsHeroSection />
      <DownloadsSection items={items} />
    </div>
  );
}
