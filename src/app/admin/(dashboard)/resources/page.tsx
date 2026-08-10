import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ResourceList } from "@/components/admin/resources/resource-list";

export default async function AdminResourcesPage() {
  const records = await prisma.resource.findMany({ orderBy: { createdAt: "asc" } });
  const resources = records.map((r) => ({ ...r, extraTags: (r.extraTags as string[]) ?? [] }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage case studies, news &amp; updates, and blogs. Pick which ones show on the home page from the Resources section edit form.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Resources" }]} />
      </div>

      <ResourceList resources={resources} />
    </div>
  );
}
