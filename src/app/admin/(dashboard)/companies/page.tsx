import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CompanyList } from "@/components/admin/companies/company-list";

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      categories: { select: { id: true } },
    },
  });

  const rows = companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    categoryCount: company.categories.length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the companies under Rotex and their product categories.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Companies" }]} />
      </div>

      <CompanyList companies={rows} />
    </div>
  );
}
