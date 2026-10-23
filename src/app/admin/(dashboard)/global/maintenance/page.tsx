import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { MaintenanceConfigForm } from "@/components/admin/home-sections/maintenance-config-form";

export default async function AdminGlobalMaintenancePage() {
  const record = await prisma.globalConfig.findUniqueOrThrow({ where: { id: "global" } });
  const config = record.data as PrismaJson.GlobalConfigData;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Maintenance Mode</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Take the public site offline with a branded holding page while you work.
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Global Config", href: "/admin/global" },
            { label: "Maintenance" },
          ]}
        />
      </div>

      <MaintenanceConfigForm config={config} />
    </div>
  );
}
