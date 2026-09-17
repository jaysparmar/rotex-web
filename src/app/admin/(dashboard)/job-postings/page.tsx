import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { JobPostingList } from "@/components/admin/job-postings/job-posting-list";
import { buildJobPostingWhere, type JobPostingFilterParams } from "@/lib/job-posting-filters";

const PAGE_SIZE = 20;

type SearchParams = JobPostingFilterParams & { page?: string };

export default async function AdminJobPostingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { page: pageParam, ...filters } = params;
  const q = filters.q ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const where = buildJobPostingWhere(filters);

  const [jobs, total, categories, locations] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.jobPosting.count({ where }),
    prisma.jobPosting.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
    prisma.jobPosting.findMany({ distinct: ["location"], select: { location: true }, orderBy: { location: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Job Postings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage open positions shown on the Career page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Job Postings" }]} />
      </div>

      <JobPostingList
        jobs={jobs}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q}
        filters={filters}
        categories={categories.map((c) => c.category)}
        locations={locations.map((l) => l.location)}
      />
    </div>
  );
}
