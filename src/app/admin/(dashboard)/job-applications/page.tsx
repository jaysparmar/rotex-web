import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { JobApplicationList } from "@/components/admin/job-applications/job-application-list";

const PAGE_SIZE = 20;

export default async function AdminJobApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [applications, total] = await Promise.all([
    prisma.jobApplication.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.jobApplication.count(),
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

      <JobApplicationList applications={applications} total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
