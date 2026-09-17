import type { Metadata } from "next";
import { DownloadsHeroSection } from "@/components/sections/downloads-hero-section";
import { DownloadsSection } from "@/components/sections/downloads-section";
import { prisma } from "@/lib/prisma";
import { flattenDownloadItems } from "@/lib/downloads-data";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("downloads"), SITE_METADATA_FALLBACK);
}

export default async function DownloadsPage() {
  const seo = await getPageSeo("downloads");
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
        industries: { select: { name: true } },
      },
    }),
    prisma.productVariant.findMany({
      select: {
        id: true,
        downloads: true,
        industries: { select: { name: true } },
        product: {
          select: {
            name: true,
            image: true,
            modelNumber: true,
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
          },
        },
      },
    }),
    prisma.industry.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    prisma.downloadCategory.findMany({ select: { id: true, name: true } }),
  ]);

  const items = flattenDownloadItems({ products, variants, downloadCategories });
  const industryOptions = industries.map((i) => i.name);

  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
      <DownloadsHeroSection />
      <DownloadsSection items={items} industryOptions={industryOptions} />
    </div>
  );
}
