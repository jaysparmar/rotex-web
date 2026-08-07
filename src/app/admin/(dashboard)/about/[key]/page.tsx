import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { HeroForm } from "@/components/admin/about-sections/hero-form";
import { StoryForm } from "@/components/admin/about-sections/story-form";
import { MissionVisionForm } from "@/components/admin/about-sections/mission-vision-form";
import { ValuesForm } from "@/components/admin/about-sections/values-form";
import { JourneyForm } from "@/components/admin/about-sections/journey-form";
import { TrustedCountriesForm } from "@/components/admin/about-sections/trusted-countries-form";
import { ZeroDowntimeCtaForm } from "@/components/admin/about-sections/zero-downtime-cta-form";
import { GrowWithRotexForm } from "@/components/admin/about-sections/grow-with-rotex-form";
import { AchievementsForm } from "@/components/admin/about-sections/achievements-form";
import { GalleryForm } from "@/components/admin/about-sections/gallery-form";
import { ResourcesForm } from "@/components/admin/about-sections/resources-form";

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

export default async function AdminAboutSectionPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = await prisma.aboutSection.findUnique({ where: { key } });

  if (!section) notFound();

  const meta = { initialEnabled: section.enabled };
  const data = section.data as never;
  const label = LABELS[key] ?? key;

  const allPartners =
    key === "story"
      ? await prisma.partner.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, logo: true },
        })
      : [];

  const allResources =
    key === "resources"
      ? await prisma.resource.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, type: true, title: true, slug: true, image: true },
        })
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this About page section.</p>
        </div>
        <Breadcrumb items={[{ label: "About Page", href: "/admin/about" }, { label }]} />
      </div>

      {key === "hero" && <HeroForm {...meta} initialData={data} />}
      {key === "story" && <StoryForm {...meta} initialData={data} allPartners={allPartners} />}
      {key === "mission-vision" && <MissionVisionForm {...meta} initialData={data} />}
      {key === "values" && <ValuesForm {...meta} initialData={data} />}
      {key === "journey" && <JourneyForm {...meta} initialData={data} />}
      {key === "trusted-countries" && <TrustedCountriesForm {...meta} initialData={data} />}
      {key === "zero-downtime-cta" && <ZeroDowntimeCtaForm {...meta} initialData={data} />}
      {key === "grow-with-rotex" && <GrowWithRotexForm {...meta} initialData={data} />}
      {key === "achievements" && <AchievementsForm {...meta} initialData={data} />}
      {key === "gallery" && <GalleryForm {...meta} initialData={data} />}
      {key === "resources" && <ResourcesForm {...meta} initialData={data} allResources={allResources} />}
    </div>
  );
}
