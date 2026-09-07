import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CategoryFlatEditForm } from "@/components/admin/categories/category-flat-edit-form";

export default async function AdminNewCategoryPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Category</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a new product category.</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Categories", href: "/admin/categories" },
            { label: "New" },
          ]}
        />
      </div>

      <CategoryFlatEditForm companies={companies} />
    </div>
  );
}
