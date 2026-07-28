import { CaseStudiesHeroSection } from "@/components/sections/case-studies-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { RESOURCE_POSTS } from "@/lib/resources-data";

export default function CaseStudiesPage() {
  return (
    <div>
      <CaseStudiesHeroSection />
      <ResourcesGridSection heading="All Case Studies" posts={RESOURCE_POSTS} basePath="/case-studies" />
    </div>
  );
}
