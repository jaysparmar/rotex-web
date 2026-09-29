import { BlogsHeroSection } from "@/components/sections/blogs-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";
import { getResourceFilterOptions } from "@/lib/resource-tags";

export default async function BlogsPage() {
  const [posts, filterOptions] = await Promise.all([getPublishedResources("blogs"), getResourceFilterOptions()]);

  return (
    <div>
      <BlogsHeroSection featured={posts[0]} />
      <ResourcesGridSection
        heading="All Blogs"
        posts={posts}
        basePath="/blogs"
        products={filterOptions.products}
        industries={filterOptions.industries}
      />
    </div>
  );
}
