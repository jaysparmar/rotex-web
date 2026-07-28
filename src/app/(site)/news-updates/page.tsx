import { NewsUpdatesHeroSection } from "@/components/sections/news-updates-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { RESOURCE_POSTS } from "@/lib/resources-data";

export default function NewsUpdatesPage() {
  return (
    <div>
      <NewsUpdatesHeroSection />
      <ResourcesGridSection heading="All News & Updates" posts={RESOURCE_POSTS} basePath="/news-updates" />
    </div>
  );
}
