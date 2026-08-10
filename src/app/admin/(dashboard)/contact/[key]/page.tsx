import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ContactHeroForm } from "@/components/admin/contact-sections/hero-form";
import { ContactOfficesForm } from "@/components/admin/contact-sections/offices-form";
import { ContactFormSectionForm } from "@/components/admin/contact-sections/form-section-form";

const LABELS: Record<string, string> = {
  hero: "Hero",
  offices: "Offices",
  form: "Contact Form",
};

export default async function AdminContactSectionPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = await prisma.contactSection.findUnique({ where: { key } });

  if (!section) notFound();

  const meta = { initialEnabled: section.enabled };
  const data = section.data as never;
  const label = LABELS[key] ?? key;

  const allPartners =
    key === "form"
      ? await prisma.partner.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, logo: true },
        })
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this Contact page section.</p>
        </div>
        <Breadcrumb items={[{ label: "Contact Page", href: "/admin/contact" }, { label }]} />
      </div>

      {key === "hero" && <ContactHeroForm {...meta} initialData={data} />}
      {key === "offices" && <ContactOfficesForm {...meta} initialData={data} />}
      {key === "form" && <ContactFormSectionForm {...meta} initialData={data} allPartners={allPartners} />}
    </div>
  );
}
