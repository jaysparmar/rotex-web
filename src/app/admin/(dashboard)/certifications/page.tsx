import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CertificationList } from "@/components/admin/certifications/certification-list";

export default async function AdminCertificationsPage() {
  const certifications = await prisma.certification.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Certifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage certification body logos shown on the home page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Certifications" }]} />
      </div>

      <CertificationList certifications={certifications} />
    </div>
  );
}
