import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { PartnerList } from "@/components/admin/partners/partner-list";

const PAGE_SIZE = 12;

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; published?: string }>;
}) {
  const { page: pageParam, q, published } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.PartnerWhereInput = {
    ...(q ? { name: { contains: q } } : {}),
    ...(published === "true" ? { published: true } : {}),
    ...(published === "false" ? { published: false } : {}),
  };

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.partner.count({ where }),
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

      <PartnerList
        partners={partners}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q ?? ""}
        published={published ?? ""}
      />
    </div>
  );
}
