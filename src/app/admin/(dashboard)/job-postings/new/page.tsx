import { Breadcrumb } from "@/components/admin/breadcrumb";
import { JobPostingEditForm } from "@/components/admin/job-postings/job-posting-edit-form";

export default function AdminNewJobPostingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Job Posting</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a new open position to the Career page.</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Job Postings", href: "/admin/job-postings" },
            { label: "New Job Posting" },
          ]}
        />
      </div>

      <JobPostingEditForm />
    </div>
  );
}
