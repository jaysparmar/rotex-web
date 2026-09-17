import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { JobApplicationList } from "@/components/admin/job-applications/job-application-list";
import { buildJobApplicationWhere, type JobApplicationFilterParams } from "@/lib/job-application-filters";

const PAGE_SIZE = 20;

type SearchParams = JobApplicationFilterParams & { page?: string };

export default async function AdminJobApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { page: pageParam, ...filters } = params;
  const q = filters.q ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const where = buildJobApplicationWhere(filters);

  const [applications, total, positions, locations] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.jobApplication.count({ where }),
    prisma.jobApplication.findMany({ distinct: ["position"], select: { position: true }, orderBy: { position: "asc" } }),
    prisma.jobApplication.findMany({ distinct: ["location"], select: { location: true }, orderBy: { location: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Job Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Applications submitted through the Career page form.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Job Applications" }]} />
      </div>

      <JobApplicationList
        applications={applications}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q}
        filters={filters}
        positions={positions.map((p) => p.position)}
        locations={locations.map((l) => l.location)}
      />
    </div>
  );
}
