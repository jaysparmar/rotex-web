import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CompanyList } from "@/components/admin/companies/company-list";

const PAGE_SIZE = 20;

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.CompanyWhereInput = q
    ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }] }
    : {};

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        categories: { select: { id: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

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

      <CompanyList companies={rows} total={total} page={page} pageSize={PAGE_SIZE} q={q ?? ""} />
    </div>
  );
}
