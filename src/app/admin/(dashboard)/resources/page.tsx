import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ResourceList } from "@/components/admin/resources/resource-list";

const PAGE_SIZE = 20;

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; published?: string; type?: string }>;
}) {
  const { page: pageParam, q, published, type } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.ResourceWhereInput = {
    ...(q ? { title: { contains: q } } : {}),
    ...(published === "true" ? { published: true } : {}),
    ...(published === "false" ? { published: false } : {}),
    ...(type ? { type } : {}),
  };

  const [records, total, typeCounts] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.resource.count({ where }),
    prisma.resource.groupBy({ by: ["type"], _count: true }),
  ]);

  const resources = records.map((r) => ({ ...r, extraTags: (r.extraTags as string[]) ?? [] }));
  const totalByType = Object.fromEntries(typeCounts.map((t) => [t.type, t._count]));
  const totalAll = typeCounts.reduce((sum, t) => sum + t._count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage case studies, news &amp; updates, and blogs. Pick which ones show on the home page from the Resources section edit form.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Resources" }]} />
      </div>

      <ResourceList
        resources={resources}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q ?? ""}
        published={published ?? ""}
        type={type ?? "all"}
        totalByType={totalByType}
        totalAll={totalAll}
      />
    </div>
  );
}
