import { CaseStudiesHeroSection } from "@/components/sections/case-studies-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";
import { getResourceFilterOptions } from "@/lib/resource-tags";

export default async function CaseStudiesPage() {
  const [posts, filterOptions] = await Promise.all([
    getPublishedResources("case-studies"),
    getResourceFilterOptions(),
  ]);

  return (
    <div>
      <CaseStudiesHeroSection featured={posts.slice(0, 2)} />
      <ResourcesGridSection
        heading="All Case Studies"
        posts={posts}
        basePath="/case-studies"
        products={filterOptions.products}
        industries={filterOptions.industries}
      />
    </div>
  );
}
