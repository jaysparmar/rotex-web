import type { Metadata } from "next";
import { SearchResultsClient } from "./search-results-client";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("search"), SITE_METADATA_FALLBACK);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const seo = await getPageSeo("search");

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <SearchResultsClient q={q ?? ""} />
    </>
  );
}
