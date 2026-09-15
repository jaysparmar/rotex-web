import type { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getProductsList } from "@/lib/products-data";
import {
  getModalSuggestions,
  searchDocuments,
  searchResources,
  searchJobs,
  getSearchCounts,
  matchingIndustryNames,
  type DocumentFilters,
} from "@/lib/search-data";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const mode = searchParams.get("mode");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  if (mode === "quick") {
    const suggestions = await getModalSuggestions(q);
    return apiSuccess(suggestions, new Date());
  }

  const documentFilters: DocumentFilters = {
    product: searchParams.get("product") ?? undefined,
    productCertificateType: searchParams.get("productCertificateType") ?? undefined,
    qualityCertificateType: searchParams.get("qualityCertificateType") ?? undefined,
    industry: searchParams.get("industry") ?? undefined,
  };

  const tab = searchParams.get("tab") ?? "all";
  const counts = await getSearchCounts(q, documentFilters);

  if (tab === "all") {
    const [{ products: productsPreview }, industryNames] = await Promise.all([
      getProductsList({ search: q, page: 1, pageSize: 4 }),
      matchingIndustryNames(q, 6),
    ]);
    return apiSuccess({ counts, productsPreview, industries: industryNames }, new Date());
  }

  if (tab === "products") {
    const { products, total } = await getProductsList({ search: q, page, pageSize: PAGE_SIZE });
    return apiSuccess({ counts, items: products, total }, new Date());
  }

  if (tab === "documents") {
    const { items, total, filterOptions } = await searchDocuments(q, documentFilters, page, PAGE_SIZE);
    return apiSuccess({ counts, items, total, filterOptions }, new Date());
  }

  if (tab === "case-studies" || tab === "blogs") {
    const { items, total } = await searchResources(q, tab, page, PAGE_SIZE);
    return apiSuccess({ counts, items, total }, new Date());
  }

  if (tab === "jobs") {
    const { items, total } = await searchJobs(q, page, PAGE_SIZE);
    return apiSuccess({ counts, items, total }, new Date());
  }

  return apiError("INVALID_TAB", `Unknown tab "${tab}"`, 400);
}
