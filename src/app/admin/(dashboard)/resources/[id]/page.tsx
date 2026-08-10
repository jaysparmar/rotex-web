import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ResourceEditForm } from "@/components/admin/resources/resource-edit-form";

export default async function AdminResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.resource.findUnique({ where: { id } });
  if (!record) notFound();

  const resource = { ...record, extraTags: (record.extraTags as string[]) ?? [] };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{resource.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">/{resource.slug}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Resources", href: "/admin/resources" },
            { label: resource.title },
          ]}
        />
      </div>

      <ResourceEditForm resource={resource} />
    </div>
  );
}
