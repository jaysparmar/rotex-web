import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CategoryEditForm } from "@/components/admin/companies/category-edit-form";
import { SubCategoryList } from "@/components/admin/companies/sub-category-list";

export default async function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string; catId: string }>;
}) {
  const { id, catId } = await params;

  const company = await prisma.company.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!company) notFound();

  const category = await prisma.category.findUnique({
    where: { id: catId },
    include: { subCategories: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
  });
  if (!category || category.companyId !== company.id) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Under {company.name}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Companies", href: "/admin/companies" },
            { label: company.name, href: `/admin/companies/${company.id}` },
            { label: category.name },
          ]}
        />
      </div>

      <CategoryEditForm companyId={company.id} companyName={company.name} category={category} />

      <SubCategoryList companyId={company.id} categoryId={category.id} subCategories={category.subCategories} />
    </div>
  );
}
