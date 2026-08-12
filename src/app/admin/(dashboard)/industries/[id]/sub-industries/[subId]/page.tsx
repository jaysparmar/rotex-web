import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublishedPartners } from "@/lib/partners";
import { getPublishedCustomerStories } from "@/lib/customer-stories";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SubIndustryEditForm } from "@/components/admin/industries/sub-industry-edit-form";

export default async function AdminSubIndustryDetailPage({
  params,
}: {
  params: Promise<{ id: string; subId: string }>;
}) {
  const { id, subId } = await params;

  const industry = await prisma.industry.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!industry) notFound();

  const subIndustry = await prisma.subIndustry.findUnique({ where: { id: subId } });
  if (!subIndustry || subIndustry.industryId !== industry.id) notFound();

  const [allPartners, allStories] = await Promise.all([
    getPublishedPartners(),
    getPublishedCustomerStories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{subIndustry.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Under {industry.name}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Industries", href: "/admin/industries" },
            { label: industry.name, href: `/admin/industries/${industry.id}` },
            { label: subIndustry.name },
          ]}
        />
      </div>

      <SubIndustryEditForm
        industryId={industry.id}
        industryName={industry.name}
        subIndustry={subIndustry}
        allPartners={allPartners}
        allStories={allStories}
      />
    </div>
  );
}
