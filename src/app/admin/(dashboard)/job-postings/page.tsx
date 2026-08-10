import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { JobPostingList } from "@/components/admin/job-postings/job-posting-list";

export default async function AdminJobPostingsPage() {
  const jobs = await prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Job Postings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage open positions shown on the Career page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Job Postings" }]} />
      </div>

      <JobPostingList jobs={jobs} />
    </div>
  );
}
