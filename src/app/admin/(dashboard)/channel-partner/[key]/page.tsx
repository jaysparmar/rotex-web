import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ChannelPartnerHeroForm } from "@/components/admin/channel-partner-sections/hero-form";
import { ChannelPartnerStatsForm } from "@/components/admin/channel-partner-sections/stats-form";
import { ChannelPartnerWhyForm } from "@/components/admin/channel-partner-sections/why-form";
import { ChannelPartnerBenefitsForm } from "@/components/admin/channel-partner-sections/benefits-form";
import { ChannelPartnerMapForm } from "@/components/admin/channel-partner-sections/map-form";
import { ChannelPartnerStoriesForm } from "@/components/admin/channel-partner-sections/stories-form";
import { ChannelPartnerFormSectionForm } from "@/components/admin/channel-partner-sections/form-section-form";

const LABELS: Record<string, string> = {
  hero: "Hero",
  stats: "Stats",
  why: "Why Choose Rotex",
  benefits: "Benefits",
  map: "Global Partner Map",
  stories: "Partner Stories",
  form: "Application Form",
};

export default async function AdminChannelPartnerSectionPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = await prisma.channelPartnerSection.findUnique({ where: { key } });

  if (!section) notFound();

  const meta = { initialEnabled: section.enabled };
  const data = section.data as never;
  const label = LABELS[key] ?? key;

  const allCountries =
    key === "map"
      ? await prisma.country.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, stateOrCity: true, partnerCompany: true },
        })
      : [];

  const allStories =
    key === "stories"
      ? await prisma.customerStory.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, quote: true, author: true, company: true, image: true, mediaType: true },
        })
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this Channel Partner page section.</p>
        </div>
        <Breadcrumb items={[{ label: "Channel Partner Page", href: "/admin/channel-partner" }, { label }]} />
      </div>

      {key === "hero" && <ChannelPartnerHeroForm {...meta} initialData={data} />}
      {key === "stats" && <ChannelPartnerStatsForm {...meta} initialData={data} />}
      {key === "why" && <ChannelPartnerWhyForm {...meta} initialData={data} />}
      {key === "benefits" && <ChannelPartnerBenefitsForm {...meta} initialData={data} />}
      {key === "map" && <ChannelPartnerMapForm {...meta} initialData={data} allCountries={allCountries} />}
      {key === "stories" && (
        <ChannelPartnerStoriesForm {...meta} initialData={data} allStories={allStories} />
      )}
      {key === "form" && <ChannelPartnerFormSectionForm {...meta} initialData={data} />}
    </div>
  );
}
