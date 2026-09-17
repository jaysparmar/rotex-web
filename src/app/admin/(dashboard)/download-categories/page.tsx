import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DownloadCategoryList } from "@/components/admin/download-categories/download-category-list";

const PAGE_SIZE = 20;

export default async function AdminDownloadCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const where = q ? { name: { contains: q } } : {};

  const [categories, total] = await Promise.all([
    prisma.downloadCategory.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.downloadCategory.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Download Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the categories admins pick from when attaching a download to a product or variant.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Download Categories" }]} />
      </div>

      <DownloadCategoryList categories={categories} total={total} page={page} pageSize={PAGE_SIZE} q={q ?? ""} />
    </div>
  );
}
