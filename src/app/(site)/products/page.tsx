import { getCategoriesWithProducts, getProductsList } from "@/lib/products-data";
import { ProductsPageClient } from "./products-page-client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategoriesWithProducts(),
    getProductsList({ categorySlug: category }),
  ]);

  return (
    <ProductsPageClient products={products} categories={categories} activeCategorySlug={category ?? null} />
  );
}
