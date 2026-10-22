import type { Metadata } from "next";
import { CsrHeroSection } from "@/components/sections/csr-hero-section";
import { ResourcesGridSection } from "@/components/sections/resources-grid-section";
import { getPublishedResources, getFeaturedResources } from "@/lib/resources";
import { getResourceFilterOptions } from "@/lib/resource-tags";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("csr"), SITE_METADATA_FALLBACK);
}

export default async function CsrPage() {
  const seo = await getPageSeo("csr");
  const [posts, featured, filterOptions] = await Promise.all([
    getPublishedResources("csr"),
    getFeaturedResources("csr"),
    getResourceFilterOptions(),
  ]);

  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
      <CsrHeroSection featured={featured[0]} />
      <ResourcesGridSection
        heading="All CSR"
        posts={posts}
        basePath="/csr"
        products={filterOptions.products}
        industries={filterOptions.industries}
      />
    </div>
  );
}
