import type { Metadata } from "next";
import { CaseStudiesHeroSection } from "@/components/sections/case-studies-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("case-studies"), SITE_METADATA_FALLBACK);
}

export default async function CaseStudiesPage() {
  const seo = await getPageSeo("case-studies");
  const posts = await getPublishedResources("case-studies");

  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
      <CaseStudiesHeroSection featured={posts.slice(0, 2)} />
      <ResourcesGridSection heading="All Case Studies" posts={posts} basePath="/case-studies" />
    </div>
  );
}
