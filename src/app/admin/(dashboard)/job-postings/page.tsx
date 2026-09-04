import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { JobPostingList } from "@/components/admin/job-postings/job-posting-list";

const PAGE_SIZE = 20;

export default async function AdminJobPostingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.jobPosting.count(),
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

      <JobPostingList jobs={jobs} total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
