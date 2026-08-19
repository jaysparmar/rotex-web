import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CategoryEditForm } from "@/components/admin/companies/category-edit-form";

export default async function AdminNewCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!company) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Category</h1>
          <p className="mt-1 text-sm text-muted-foreground">Under {company.name}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Companies", href: "/admin/companies" },
            { label: company.name, href: `/admin/companies/${company.id}` },
            { label: "New Category" },
          ]}
        />
      </div>

      <CategoryEditForm companyId={company.id} companyName={company.name} />
    </div>
  );
}
