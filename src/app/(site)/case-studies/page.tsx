import { CaseStudiesHeroSection } from "@/components/sections/case-studies-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources } from "@/lib/resources";

export default async function CaseStudiesPage() {
  const posts = await getPublishedResources("case-studies");

  return (
    <div>
      <CaseStudiesHeroSection featured={posts.slice(0, 2)} />
      <ResourcesGridSection heading="All Case Studies" posts={posts} basePath="/case-studies" />
    </div>
  );
}
