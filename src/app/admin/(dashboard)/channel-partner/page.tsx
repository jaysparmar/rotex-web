import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ChannelPartnerSectionRow } from "@/components/admin/channel-partner-sections/channel-partner-section-row";

const LABELS: Record<string, string> = {
  hero: "Hero",
  stats: "Stats",
  why: "Why Choose Rotex",
  benefits: "Benefits",
  map: "Global Partner Map",
  stories: "Partner Stories",
  form: "Application Form",
};

export default async function AdminChannelPartnerPage() {
  const sections = await prisma.channelPartnerSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Channel Partner Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit content for each section shown on the public Channel Partner page. Order is fixed.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {sections.map((s) => (
            <ChannelPartnerSectionRow key={s.key} sectionKey={s.key} label={LABELS[s.key] ?? s.key} enabled={s.enabled} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
