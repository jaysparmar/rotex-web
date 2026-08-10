import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { EnquiriesTabs } from "@/components/admin/enquiries/enquiries-tabs";

export default async function AdminEnquiriesPage() {
  const [industries, enquiries] = await Promise.all([
    prisma.industry.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "asc" } }),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submissions from the industry enquiry forms, the Contact page, and Supplier applications.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Enquiries" }]} />
      </div>

      <EnquiriesTabs industries={industries} enquiries={enquiries} />
    </div>
  );
}
