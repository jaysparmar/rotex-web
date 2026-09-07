import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublishedPartners } from "@/lib/partners";
import { getPublishedCustomerStories } from "@/lib/customer-stories";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SubIndustryEditForm } from "@/components/admin/industries/sub-industry-edit-form";

export default async function AdminNewSubIndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const industry = await prisma.industry.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!industry) notFound();

  const [allPartners, allStories, categories] = await Promise.all([
    getPublishedPartners(),
    getPublishedCustomerStories(),
    prisma.category.findMany({
      where: { products: { some: {} } },
      orderBy: { order: "asc" },
      select: { id: true, name: true, image: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Sub-Industry</h1>
          <p className="mt-1 text-sm text-muted-foreground">Under {industry.name}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Industries", href: "/admin/industries" },
            { label: industry.name, href: `/admin/industries/${industry.id}` },
            { label: "New Sub-Industry" },
          ]}
        />
      </div>

      <SubIndustryEditForm
        industryId={industry.id}
        industryName={industry.name}
        allPartners={allPartners}
        allStories={allStories}
        categories={categories}
      />
    </div>
  );
}
