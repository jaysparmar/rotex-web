import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getIndustryWithSubIndustries } from "@/lib/industries";
import { SubIndustryContent } from "@/components/sections/sub-industry-content";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { industrySeoKey } from "@/lib/seo-collections";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

type Props = { params: Promise<{ sector: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector } = await params;
  const industry = await getIndustryWithSubIndustries(sector);
  const fallback = industry
    ? { title: `${industry.name} | Rotex`, description: industry.description || SITE_METADATA_FALLBACK.description }
    : SITE_METADATA_FALLBACK;
  return buildMetadata(await getPageSeo(industrySeoKey(sector)), fallback);
}

/*
  Landing on the sector itself shows the first sub-sector inline (and its tab
  reads as selected) instead of redirecting into /[sub]. No auto-scroll here —
  the page opens at the top. Scrolling only happens when the URL names a sub.
*/
export default async function IndustryPage({ params }: Props) {
  const { sector } = await params;
  const [industry, seo] = await Promise.all([getIndustryWithSubIndustries(sector), getPageSeo(industrySeoKey(sector))]);
  if (!industry) notFound();

  if (!industry.useSubIndustries) {
    return (
      <>
        <SeoJsonLd schema={seo.schema} />
        <SubIndustryContent
          industry={industry}
          subIndustry={{
            name: industry.name,
            description: industry.description,
            image: industry.image,
            mobileImage: industry.mobileImage,
            partnerIds: industry.partnerIds,
            storyIds: industry.storyIds,
            challengesTitle: industry.challengesTitle,
            challenges: industry.challenges,
            solutionsTitle: industry.solutionsTitle,
            solutions: industry.solutions,
            recommendedProducts: industry.recommendedProducts,
          }}
        />
      </>
    );
  }

  const firstSub = industry.subIndustries[0];
  if (!firstSub) return null;

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <SubIndustryContent industry={industry} subIndustry={firstSub} />
    </>
  );
}
