import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { SortableSectionList } from "@/components/admin/sortable-section-list";

export default async function AdminHomePage() {
  const sections = await prisma.homeSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Home Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag to reorder sections shown on the public home page.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <SortableSectionList
            sections={sections.map((s) => ({ key: s.key, enabled: s.enabled }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
