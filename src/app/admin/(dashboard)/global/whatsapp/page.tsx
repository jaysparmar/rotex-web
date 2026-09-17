import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { WhatsappConfigForm } from "@/components/admin/home-sections/whatsapp-config-form";

export default async function AdminGlobalWhatsappPage() {
  const record = await prisma.globalConfig.findUniqueOrThrow({ where: { id: "global" } });
  const config = record.data as PrismaJson.GlobalConfigData;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">WhatsApp Button</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Floating WhatsApp button shown in the bottom-right corner of every public page.
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Global Config", href: "/admin/global" },
            { label: "WhatsApp" },
          ]}
        />
      </div>

      <WhatsappConfigForm config={config} />
    </div>
  );
}
