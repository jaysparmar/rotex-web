import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSubIndustryDetail } from "@/lib/industries";
import { SubIndustryContent } from "@/components/sections/sub-industry-content";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { industrySeoKey } from "@/lib/seo-collections";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

type Props = { params: Promise<{ sector: string; sub: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector, sub } = await params;
  const result = await getSubIndustryDetail(sector, sub);
  const fallback = result
    ? {
        title: `${result.subIndustry.name} | ${result.industry.name} | Rotex`,
        description: result.subIndustry.description || SITE_METADATA_FALLBACK.description,
      }
    : SITE_METADATA_FALLBACK;
  return buildMetadata(await getPageSeo(industrySeoKey(sector, sub)), fallback);
}

export default async function IndustrySubPage({ params }: Props) {
  const { sector, sub } = await params;

  const [result, seo] = await Promise.all([getSubIndustryDetail(sector, sub), getPageSeo(industrySeoKey(sector, sub))]);
  if (!result) notFound();

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <SubIndustryContent industry={result.industry} subIndustry={result.subIndustry} />
    </>
  );
}
