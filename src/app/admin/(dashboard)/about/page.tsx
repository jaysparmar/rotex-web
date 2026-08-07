import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { AboutSectionRow } from "@/components/admin/about-sections/about-section-row";

const LABELS: Record<string, string> = {
  hero: "Hero",
  story: "Our Story",
  "mission-vision": "Mission & Vision",
  values: "Values",
  journey: "Journey Timeline",
  "trusted-countries": "Trusted Countries",
  "zero-downtime-cta": "Zero Downtime CTA",
  "grow-with-rotex": "Grow With Rotex",
  achievements: "Achievements",
  gallery: "Gallery",
  resources: "Resources",
};

export default async function AdminAboutPage() {
  const sections = await prisma.aboutSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">About Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit content for each section shown on the public About page. Order is fixed.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {sections.map((s) => (
            <AboutSectionRow key={s.key} sectionKey={s.key} label={LABELS[s.key] ?? s.key} enabled={s.enabled} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
