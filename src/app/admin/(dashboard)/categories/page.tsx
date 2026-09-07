import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CategoryFlatList } from "@/components/admin/categories/category-flat-list";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ company: { name: "asc" } }, { order: "asc" }],
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { products: true, subCategories: true } },
    },
  });

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

      <CategoryFlatList categories={rows} />
    </div>
  );
}
