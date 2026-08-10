import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { SupplierSectionRow } from "@/components/admin/supplier-sections/supplier-section-row";

const LABELS: Record<string, string> = {
  hero: "Hero",
  benefits: "Benefits",
  form: "Application Form",
};

export default async function AdminSupplierPage() {
  const sections = await prisma.supplierSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Supplier Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit content for each section shown on the public Become a Supplier page.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {sections.map((s) => (
            <SupplierSectionRow key={s.key} sectionKey={s.key} label={LABELS[s.key] ?? s.key} enabled={s.enabled} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
