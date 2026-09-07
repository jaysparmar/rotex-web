import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CategoryFlatEditForm } from "@/components/admin/categories/category-flat-edit-form";

export default async function AdminEditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [category, companies] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this category.</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Categories", href: "/admin/categories" },
            { label: category.name },
          ]}
        />
      </div>

      <CategoryFlatEditForm companies={companies} category={category} />
    </div>
  );
}
