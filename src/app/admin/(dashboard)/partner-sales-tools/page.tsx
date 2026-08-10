import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PartnerToolsSectionRow as SectionRow } from "@/components/admin/partner-tools-sections/partner-tools-section-row";

const LABELS: Record<string, string> = {
  hero: "Hero",
  tools: "Tools",
};

export default async function AdminPartnerSalesToolsPage() {
  const sections = await prisma.partnerToolsSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Partner Sales Tools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit content for the Sales Partner Portal tools grid.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {sections.map((s) => (
            <SectionRow key={s.key} sectionKey={s.key} label={LABELS[s.key] ?? s.key} enabled={s.enabled} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
