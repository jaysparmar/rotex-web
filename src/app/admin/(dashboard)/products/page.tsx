import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ProductList } from "@/components/admin/products/product-list";
import { buildProductWhere, type ProductFilterParams } from "@/lib/product-filters";
import { getCompanyCategoryTree, getIndustryTree, getAttributeValuesByKey } from "@/lib/products";

const PAGE_SIZE = 20;

type SearchParams = ProductFilterParams & { page?: string };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { page: pageParam, ...filters } = params;
  const q = filters.q ?? "";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = buildProductWhere(filters);

  const [products, total, companies, industries, attributeValues] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { modelNumber: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: { select: { name: true } },
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
    getCompanyCategoryTree(),
    getIndustryTree(),
    getAttributeValuesByKey(),
  ]);

  const rows = products.map(({ _count, ...product }) => ({
    ...product,
    variantCount: _count.variants,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the product catalog — simple products and variable products with variants.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Products" }]} />
      </div>

      <ProductList
        products={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q}
        filters={filters}
        companies={companies}
        industries={industries}
        attributeValues={attributeValues}
      />
    </div>
  );
}
