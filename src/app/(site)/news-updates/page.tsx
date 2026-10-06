import type { Metadata } from "next";
import { NewsUpdatesHeroSection } from "@/components/sections/news-updates-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources, getFeaturedResources } from "@/lib/resources";
import { getResourceFilterOptions } from "@/lib/resource-tags";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("news-updates"), SITE_METADATA_FALLBACK);
}

export default async function NewsUpdatesPage() {
  const seo = await getPageSeo("news-updates");
  const [posts, featured, filterOptions] = await Promise.all([
    getPublishedResources("news"),
    getFeaturedResources("news"),
    getResourceFilterOptions(),
  ]);

  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
      <NewsUpdatesHeroSection highlighted={featured} />
      <ResourcesGridSection
        heading="All News & Updates"
        posts={posts}
        basePath="/news-updates"
        products={filterOptions.products}
        industries={filterOptions.industries}
      />
    </div>
  );
}
