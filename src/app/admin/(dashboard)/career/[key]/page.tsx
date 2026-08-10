import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CareerHeroForm } from "@/components/admin/career-sections/hero-form";
import { CareerValuesForm } from "@/components/admin/career-sections/values-form";
import { CareerGalleryForm } from "@/components/admin/career-sections/gallery-form";
import { CareerWhyForm } from "@/components/admin/career-sections/why-form";
import { CareerPositionsForm } from "@/components/admin/career-sections/positions-form";
import { CareerFormSectionForm } from "@/components/admin/career-sections/form-section-form";

const LABELS: Record<string, string> = {
  hero: "Hero",
  values: "Life at Rotex (Values)",
  gallery: "Gallery",
  why: "Why Work at Rotex",
  positions: "Open Positions Heading",
  form: "Application Form",
};

export default async function AdminCareerSectionPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = await prisma.careerSection.findUnique({ where: { key } });

  if (!section) notFound();

  const meta = { initialEnabled: section.enabled };
  const data = section.data as never;
  const label = LABELS[key] ?? key;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this Career page section.</p>
        </div>
        <Breadcrumb items={[{ label: "Career Page", href: "/admin/career" }, { label }]} />
      </div>

      {key === "hero" && <CareerHeroForm {...meta} initialData={data} />}
      {key === "values" && <CareerValuesForm {...meta} initialData={data} />}
      {key === "gallery" && <CareerGalleryForm {...meta} initialData={data} />}
      {key === "why" && <CareerWhyForm {...meta} initialData={data} />}
      {key === "positions" && <CareerPositionsForm {...meta} initialData={data} />}
      {key === "form" && <CareerFormSectionForm {...meta} initialData={data} />}
    </div>
  );
}
