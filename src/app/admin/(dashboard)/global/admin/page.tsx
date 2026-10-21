import { getAdminConfig } from "@/lib/admin-config";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { AdminConfigForm } from "@/components/admin/home-sections/admin-config-form";

export default async function AdminGlobalAdminPage() {
  const data = await getAdminConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Branding for the admin panel itself — not shown on the public site.
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Global Config", href: "/admin/global" },
            { label: "Admin Panel" },
          ]}
        />
      </div>

      <AdminConfigForm initialData={data} />
    </div>
  );
}
