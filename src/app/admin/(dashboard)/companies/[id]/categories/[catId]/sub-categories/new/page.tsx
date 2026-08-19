import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SubCategoryEditForm } from "@/components/admin/companies/sub-category-edit-form";

export default async function AdminNewSubCategoryPage({
  params,
}: {
  params: Promise<{ id: string; catId: string }>;
}) {
  const { id, catId } = await params;

  const company = await prisma.company.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!company) notFound();

  const category = await prisma.category.findUnique({ where: { id: catId }, select: { id: true, name: true, companyId: true } });
  if (!category || category.companyId !== company.id) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Sub-Category</h1>
          <p className="mt-1 text-sm text-muted-foreground">Under {company.name} / {category.name}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Companies", href: "/admin/companies" },
            { label: company.name, href: `/admin/companies/${company.id}` },
            { label: category.name, href: `/admin/companies/${company.id}/categories/${category.id}` },
            { label: "New Sub-Category" },
          ]}
        />
      </div>

      <SubCategoryEditForm companyId={company.id} categoryId={category.id} categoryName={category.name} />
    </div>
  );
}
