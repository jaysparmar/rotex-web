import { NewsUpdatesHeroSection } from "@/components/sections/news-updates-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";
import { getResourceFilterOptions } from "@/lib/resource-tags";

export default async function NewsUpdatesPage() {
  const [posts, filterOptions] = await Promise.all([getPublishedResources("news"), getResourceFilterOptions()]);

  return (
    <div>
      <NewsUpdatesHeroSection highlighted={posts.slice(0, 4)} />
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
