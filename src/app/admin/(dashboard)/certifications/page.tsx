import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CertificationList } from "@/components/admin/certifications/certification-list";

const PAGE_SIZE = 12;

export default async function AdminCertificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [certifications, total] = await Promise.all([
    prisma.certification.findMany({
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.certification.count(),
  ]);

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

      <CertificationList certifications={certifications} total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
