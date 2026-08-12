import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { IndustryEditForm } from "@/components/admin/industries/industry-edit-form";
import { SubIndustryList } from "@/components/admin/industries/sub-industry-list";

export default async function AdminIndustryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const industry = await prisma.industry.findUnique({
    where: { id },
    include: { subIndustries: { orderBy: { createdAt: "asc" } } },
  });

  if (!industry) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{industry.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">/industries/{industry.slug}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Industries", href: "/admin/industries" },
            { label: industry.name },
          ]}
        />
      </div>

      <IndustryEditForm industry={industry} />

      <SubIndustryList industryId={industry.id} subIndustries={industry.subIndustries} />
    </div>
  );
}
