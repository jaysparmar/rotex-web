import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ResourceEditForm } from "@/components/admin/resources/resource-edit-form";

export default async function AdminNewResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Resource</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a case study, news update, or blog post.</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Resources", href: "/admin/resources" },
            { label: "New Resource" },
          ]}
        />
      </div>

      <ResourceEditForm defaultType={type} />
    </div>
  );
}
