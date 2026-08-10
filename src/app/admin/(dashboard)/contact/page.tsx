import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ContactSectionRow } from "@/components/admin/contact-sections/contact-section-row";

const LABELS: Record<string, string> = {
  hero: "Hero",
  offices: "Offices",
  form: "Contact Form",
};

export default async function AdminContactPage() {
  const sections = await prisma.contactSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contact Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit content for each section shown on the public Contact page. Order is fixed.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {sections.map((s) => (
            <ContactSectionRow key={s.key} sectionKey={s.key} label={LABELS[s.key] ?? s.key} enabled={s.enabled} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
