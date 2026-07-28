import { BlogsHeroSection } from "@/components/sections/blogs-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { RESOURCE_POSTS } from "@/lib/resources-data";

export default function BlogsPage() {
  return (
    <div>
      <BlogsHeroSection />
      <ResourcesGridSection heading="All Blogs" posts={RESOURCE_POSTS} basePath="/blogs" />
    </div>
  );
}
