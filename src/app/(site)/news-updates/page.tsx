import type { Metadata } from "next";
import { NewsUpdatesHeroSection } from "@/components/sections/news-updates-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("news-updates"), SITE_METADATA_FALLBACK);
}

export default async function NewsUpdatesPage() {
  const seo = await getPageSeo("news-updates");
  const posts = await getPublishedResources("news");

  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
      <NewsUpdatesHeroSection highlighted={posts.slice(0, 4)} />
      <ResourcesGridSection heading="All News & Updates" posts={posts} basePath="/news-updates" />
    </div>
  );
}
