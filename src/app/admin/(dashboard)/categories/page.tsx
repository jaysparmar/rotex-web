import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CategoryFlatList } from "@/components/admin/categories/category-flat-list";

const PAGE_SIZE = 20;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; companyId?: string }>;
}) {
  const { page: pageParam, q, companyId } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.CategoryWhereInput = {
    ...(q ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }] } : {}),
    ...(companyId ? { companyId } : {}),
  };

  const [categories, total, companies] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: [{ company: { name: "asc" } }, { order: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: { select: { id: true, name: true } },
        _count: { select: { products: true, subCategories: true } },
      },
    }),
    prisma.category.count({ where }),
    prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    companyId: c.companyId,
    companyName: c.company.name,
    productCount: c._count.products,
    subCategoryCount: c._count.subCategories,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All product categories across every company, in one place. This is what the homepage&apos;s
            Products section and the /products page filters pull from.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Categories" }]} />
      </div>

      <CategoryFlatList
        categories={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q ?? ""}
        companyId={companyId ?? ""}
        companies={companies}
      />
    </div>
  );
}
