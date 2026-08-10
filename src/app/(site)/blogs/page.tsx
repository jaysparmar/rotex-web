import { BlogsHeroSection } from "@/components/sections/blogs-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";

export default async function BlogsPage() {
  const posts = await getPublishedResources("blogs");

  return (
    <div>
      <BlogsHeroSection featured={posts[0]} />
      <ResourcesGridSection heading="All Blogs" posts={posts} basePath="/blogs" />
    </div>
  );
}
