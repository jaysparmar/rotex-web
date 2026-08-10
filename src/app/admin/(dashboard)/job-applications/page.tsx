import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";

export default async function AdminJobApplicationsPage() {
  const applications = await prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Job Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Applications submitted through the Career page form.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Job Applications" }]} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2.5 pl-5 pr-3 font-medium">Name</th>
                <th className="py-2.5 pr-3 font-medium">Position</th>
                <th className="py-2.5 pr-3 font-medium">Experience</th>
                <th className="py-2.5 pr-3 font-medium">Location</th>
                <th className="py-2.5 pr-3 font-medium">Phone</th>
                <th className="py-2.5 pr-3 font-medium">Email</th>
                <th className="py-2.5 pr-3 font-medium">Expected Salary</th>
                <th className="py-2.5 pr-3 font-medium">Notice Period</th>
                <th className="py-2.5 pr-3 font-medium">Message</th>
                <th className="py-2.5 pr-3 font-medium">Resume</th>
                <th className="py-2.5 pr-5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                    No applications yet.
                  </td>
                </tr>
              )}
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5 pl-5 pr-3 font-medium whitespace-nowrap">{a.fullName}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{a.position}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{a.experience}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{a.location}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{a.phone}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{a.email}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{a.expectedSalary ?? "—"}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{a.noticePeriod ?? "—"}</td>
                  <td className="max-w-64 truncate py-2.5 pr-3" title={a.message}>{a.message}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    {a.resumeUrl ? (
                      <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2.5 pr-5 whitespace-nowrap text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
