import type { Metadata } from "next";
import {
  getCategoriesWithProducts,
  getProductsList,
  getSubCategoriesWithProducts,
  getIndustriesWithProducts,
  getCombinedCategoryFaqs,
} from "@/lib/products-data";
import { ProductFaqsSection } from "@/components/sections/product-faqs-section";
import { getAttributeValuesByKey } from "@/lib/products";
import { ProductsPageClient } from "./products-page-client";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

const PAGE_SIZE = 30;

type SearchParams = {
  category?: string;
  type?: string;
  industry?: string;
  search?: string;
  size?: string;
  variantType?: string;
  orifice?: string;
  minOperatingTemp?: string;
  maxOperatingTemp?: string;
  flowFactor?: string;
  page?: string;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("products"), SITE_METADATA_FALLBACK);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, type, industry, search, page: pageParam, ...attrFilters } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const industrySlugs = industry ? industry.split(",").filter(Boolean) : [];

  const seo = await getPageSeo("products");
  const [categories, subCategories, industries, { products, total }, attributeValues, faqs] = await Promise.all([
    getCategoriesWithProducts(),
    getSubCategoriesWithProducts(category),
    getIndustriesWithProducts(category),
    getProductsList({ categorySlug: category, subCategorySlug: type, industrySlugs, search, page, pageSize: PAGE_SIZE, ...attrFilters }),
    getAttributeValuesByKey(category),
    getCombinedCategoryFaqs(),
  ]);

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <ProductsPageClient
        products={products}
        categories={categories}
        activeCategorySlug={category ?? null}
        subCategories={subCategories}
        activeSubCategorySlug={type ?? null}
        industries={industries}
        activeIndustrySlugs={industrySlugs}
        attributeValues={attributeValues}
        activeFilters={attrFilters}
        activeSearch={search ?? ""}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      />
      <ProductFaqsSection faqs={faqs} />
    </>
  );
}
