import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { IndustryList } from "@/components/admin/industries/industry-list";

export default async function AdminIndustriesPage() {
  const industries = await prisma.industry.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      subIndustries: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const rows = industries.map((industry) => ({
    ...industry,
    subIndustryCount: industry.subIndustries.length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Industries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the industry sectors shown on the home page and their dedicated pages.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Industries" }]} />
      </div>

      <IndustryList industries={rows} />
    </div>
  );
}
