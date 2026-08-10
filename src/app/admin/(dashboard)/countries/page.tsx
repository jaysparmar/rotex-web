import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CountryList } from "@/components/admin/countries/country-list";

export default async function AdminCountriesPage() {
  const countries = await prisma.country.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Countries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared location records used by the About Us trusted-countries globe and the Channel Partner map.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Countries" }]} />
      </div>

      <CountryList countries={countries} />
    </div>
  );
}
