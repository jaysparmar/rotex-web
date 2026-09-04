import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CountryList } from "@/components/admin/countries/country-list";

const PAGE_SIZE = 20;

export default async function AdminCountriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [countries, total] = await Promise.all([
    prisma.country.findMany({
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.country.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Countries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared location records used by the About Us trusted-countries globe and the Channel Partner map.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Countries" }]} />
      </div>

      <CountryList countries={countries} total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
