import type { Metadata } from "next";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";
import { PartnerSalesToolsClient } from "./partner-sales-tools-client";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("join-partner-sales-tools"), SITE_METADATA_FALLBACK);
}

export default async function PartnerSalesToolsPage() {
  const seo = await getPageSeo("join-partner-sales-tools");

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <PartnerSalesToolsClient />
    </>
  );
}
