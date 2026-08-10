import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { PartnerToolsHeroForm } from "@/components/admin/partner-tools-sections/hero-form";
import { PartnerToolsListForm } from "@/components/admin/partner-tools-sections/tools-form";

const LABELS: Record<string, string> = {
  hero: "Hero",
  tools: "Tools",
};

export default async function AdminPartnerToolsSectionPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = await prisma.partnerToolsSection.findUnique({ where: { key } });

  if (!section) notFound();

  const meta = { initialEnabled: section.enabled };
  const data = section.data as never;
  const label = LABELS[key] ?? key;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this Partner Sales Tools section.</p>
        </div>
        <Breadcrumb items={[{ label: "Partner Sales Tools", href: "/admin/partner-sales-tools" }, { label }]} />
      </div>

      {key === "hero" && <PartnerToolsHeroForm {...meta} initialData={data} />}
      {key === "tools" && <PartnerToolsListForm {...meta} initialData={data} />}
    </div>
  );
}
