import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ProductList } from "@/components/admin/products/product-list";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.ProductWhereInput = q
    ? { OR: [{ name: { contains: q } }, { modelNumber: { contains: q } }] }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { modelNumber: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
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

      <ProductList products={rows} total={total} page={page} pageSize={PAGE_SIZE} q={q} />
    </div>
  );
}
