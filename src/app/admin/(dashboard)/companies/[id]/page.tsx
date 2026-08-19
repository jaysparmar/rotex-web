import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CompanyEditForm } from "@/components/admin/companies/company-edit-form";
import { CategoryList } from "@/components/admin/companies/category-list";

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          subCategories: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  if (!company) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{company.slug}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Companies", href: "/admin/companies" },
            { label: company.name },
          ]}
        />
      </div>

      <CompanyEditForm company={company} />

      <CategoryList companyId={company.id} categories={company.categories} />
    </div>
  );
}
