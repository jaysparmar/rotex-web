import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { JobPostingEditForm } from "@/components/admin/job-postings/job-posting-edit-form";

export default async function AdminJobPostingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Job Postings", href: "/admin/job-postings" },
            { label: job.title },
          ]}
        />
      </div>

      <JobPostingEditForm job={job} />
    </div>
  );
}
