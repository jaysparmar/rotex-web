import { Breadcrumb } from "@/components/admin/breadcrumb";
import { JobPostingEditForm } from "@/components/admin/job-postings/job-posting-edit-form";
import { prisma } from "@/lib/prisma";

export default async function AdminNewJobPostingPage() {
  const [companies, categories] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true }, distinct: ["name"] }),
  ]);

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

      <JobPostingEditForm
        companyOptions={companies.map((c) => c.name)}
        tagOptions={categories.map((c) => c.name)}
      />
    </div>
  );
}
