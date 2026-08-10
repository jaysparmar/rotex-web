import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AwardList } from "@/components/admin/awards/award-list";
import { AwardsHeroForm } from "@/components/admin/about-sections/awards-hero-form";

export default async function AdminAwardsPage() {
  const [awards, heroSection] = await Promise.all([
    prisma.award.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.aboutSection.findUnique({ where: { key: "awards" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Awards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage individual award records shown on the Awards &amp; Recognition page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Awards" }]} />
      </div>

      <AwardList awards={awards} />

      {heroSection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Awards &amp; Recognition Page</CardTitle>
            <p className="text-sm text-muted-foreground">
              Title, description, and enable/disable for the standalone /about/awards page.
            </p>
          </CardHeader>
          <CardContent>
            <AwardsHeroForm
              initialEnabled={heroSection.enabled}
              initialData={heroSection.data as { title: string; description: string }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
