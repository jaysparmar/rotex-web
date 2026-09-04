import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AwardList } from "@/components/admin/awards/award-list";
import { AwardsHeroForm } from "@/components/admin/about-sections/awards-hero-form";

const PAGE_SIZE = 20;

export default async function AdminAwardsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [awards, total, heroSection] = await Promise.all([
    prisma.award.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.award.count(),
    prisma.aboutSection.findUnique({ where: { key: "awards" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Awards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage individual award records shown on the Awards &amp; Recognition page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Awards" }]} />
      </div>

      <AwardList awards={awards} total={total} page={page} pageSize={PAGE_SIZE} />

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
