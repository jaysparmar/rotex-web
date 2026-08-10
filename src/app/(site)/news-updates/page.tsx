import { NewsUpdatesHeroSection } from "@/components/sections/news-updates-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";

export default async function NewsUpdatesPage() {
  const posts = await getPublishedResources("news");

  return (
    <div>
      <NewsUpdatesHeroSection highlighted={posts.slice(0, 4)} />
      <ResourcesGridSection heading="All News & Updates" posts={posts} basePath="/news-updates" />
    </div>
  );
}
