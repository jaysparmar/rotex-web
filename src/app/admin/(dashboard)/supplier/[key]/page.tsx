import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SupplierHeroForm } from "@/components/admin/supplier-sections/hero-form";
import { SupplierBenefitsForm } from "@/components/admin/supplier-sections/benefits-form";
import { SupplierFormSectionForm } from "@/components/admin/supplier-sections/form-section-form";

const LABELS: Record<string, string> = {
  hero: "Hero",
  benefits: "Benefits",
  form: "Application Form",
};

export default async function AdminSupplierSectionPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = await prisma.supplierSection.findUnique({ where: { key } });

  if (!section) notFound();

  const meta = { initialEnabled: section.enabled };
  const data = section.data as never;
  const label = LABELS[key] ?? key;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this Supplier page section.</p>
        </div>
        <Breadcrumb items={[{ label: "Supplier Page", href: "/admin/supplier" }, { label }]} />
      </div>

      {key === "hero" && <SupplierHeroForm {...meta} initialData={data} />}
      {key === "benefits" && <SupplierBenefitsForm {...meta} initialData={data} />}
      {key === "form" && <SupplierFormSectionForm {...meta} initialData={data} />}
    </div>
  );
}
