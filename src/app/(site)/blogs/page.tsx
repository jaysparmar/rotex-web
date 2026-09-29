import type { Metadata } from "next";
import { BlogsHeroSection } from "@/components/sections/blogs-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";
import { getResourceFilterOptions } from "@/lib/resource-tags";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("blogs"), SITE_METADATA_FALLBACK);
}

export default async function BlogsPage() {
  const seo = await getPageSeo("blogs");
  const [posts, filterOptions] = await Promise.all([getPublishedResources("blogs"), getResourceFilterOptions()]);

  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
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
