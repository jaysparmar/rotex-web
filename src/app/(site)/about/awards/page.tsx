import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchAboutSection } from "@/lib/site-api";
import { getPublishedAwards } from "@/lib/awards";
import { AwardsHeroSection } from "@/components/sections/awards-hero-section";
import { AwardsGrid } from "@/components/sections/awards-grid";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

type AwardsHeroData = { title: string; description: string };

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("about-awards"), SITE_METADATA_FALLBACK);
}

export default async function AwardsPage() {
  const hero = await fetchAboutSection<AwardsHeroData>("awards");
  if (!hero?.enabled) notFound();

  const seo = await getPageSeo("about-awards");
  const awards = await getPublishedAwards();

  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
      <AwardsHeroSection title={hero.title} description={hero.description} />

      {/* Breadcrumb lives inside AwardsHeroSection */}
      <AwardsGrid
        awards={awards.map((a) => ({
          slug: a.slug,
          url: a.url,
          year: a.year,
          title: a.title,
          description: a.description,
          image: a.image,
        }))}
      />
    </div>
  );
}
