import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CareerSectionRow } from "@/components/admin/career-sections/career-section-row";

const LABELS: Record<string, string> = {
  hero: "Hero",
  values: "Life at Rotex (Values)",
  gallery: "Gallery",
  why: "Why Work at Rotex",
  positions: "Open Positions Heading",
  form: "Application Form",
};

export default async function AdminCareerPage() {
  const sections = await prisma.careerSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Career Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit content for each section shown on the public Career page. Manage individual job listings on the Job
          Postings page.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {sections.map((s) => (
            <CareerSectionRow key={s.key} sectionKey={s.key} label={LABELS[s.key] ?? s.key} enabled={s.enabled} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
