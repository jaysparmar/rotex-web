import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { PartnerList } from "@/components/admin/partners/partner-list";

const PAGE_SIZE = 15;

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.partner.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Partners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage partner logos shown on the home page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Partners" }]} />
      </div>

      <PartnerList partners={partners} total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
