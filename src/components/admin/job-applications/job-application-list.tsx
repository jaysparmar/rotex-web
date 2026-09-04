import { FileText } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { EmptyState } from "@/components/admin/empty-state";

type JobApplication = {
  id: string;
  fullName: string;
  position: string;
  experience: string;
  location: string;
  phone: string;
  email: string;
  expectedSalary: string | null;
  noticePeriod: string | null;
  message: string;
  resumeUrl: string | null;
  createdAt: Date;
};

export function JobApplicationList({
  applications,
  total,
  page,
  pageSize,
}: {
  applications: JobApplication[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(nextPage: number) {
    return `/admin/job-applications?page=${nextPage}`;
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <EmptyState icon={FileText} title="No applications yet" description="Applications submitted through the Career page form will show up here." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Expected Salary</TableHead>
            <TableHead>Notice Period</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead className="pr-5">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((a) => (
            <TableRow key={a.id} hoverable>
              <TableCell className="pl-5 font-medium whitespace-nowrap">{a.fullName}</TableCell>
              <TableCell className="whitespace-nowrap">{a.position}</TableCell>
              <TableCell className="whitespace-nowrap">{a.experience}</TableCell>
              <TableCell className="whitespace-nowrap">{a.location}</TableCell>
              <TableCell className="whitespace-nowrap">{a.phone}</TableCell>
              <TableCell className="whitespace-nowrap">{a.email}</TableCell>
              <TableCell className="whitespace-nowrap">{a.expectedSalary ?? "—"}</TableCell>
              <TableCell className="whitespace-nowrap">{a.noticePeriod ?? "—"}</TableCell>
              <TableCell className="max-w-64 truncate" title={a.message}>
                {a.message}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {a.resumeUrl ? (
                  <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    View
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="pr-5 whitespace-nowrap text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {total > 0 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          itemLabel="application"
          pageHref={pageHref}
        />
      )}
    </div>
  );
}
