import { SearchResultsClient } from "./search-results-client";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <SearchResultsClient q={q ?? ""} />;
}
