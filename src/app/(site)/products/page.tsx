import { getCategoriesWithProducts, getProductsList, getSubCategoriesWithProducts } from "@/lib/products-data";
import { getAttributeValuesByKey } from "@/lib/products";
import { ProductsPageClient } from "./products-page-client";

const PAGE_SIZE = 30;

type SearchParams = {
  category?: string;
  type?: string;
  search?: string;
  size?: string;
  variantType?: string;
  orifice?: string;
  minOperatingTemp?: string;
  maxOperatingTemp?: string;
  flowFactor?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, type, search, page: pageParam, ...attrFilters } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [categories, subCategories, { products, total }, attributeValues] = await Promise.all([
    getCategoriesWithProducts(),
    getSubCategoriesWithProducts(category),
    getProductsList({ categorySlug: category, subCategorySlug: type, search, page, pageSize: PAGE_SIZE, ...attrFilters }),
    getAttributeValuesByKey(),
  ]);

  return (
    <ProductsPageClient
      products={products}
      categories={categories}
      activeCategorySlug={category ?? null}
      subCategories={subCategories}
      activeSubCategorySlug={type ?? null}
      attributeValues={attributeValues}
      activeFilters={attrFilters}
      activeSearch={search ?? ""}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
    />
  );
}
