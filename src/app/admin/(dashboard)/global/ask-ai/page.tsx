import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { AskAiConfigForm } from "@/components/admin/home-sections/ask-ai-config-form";

export default async function AdminGlobalAskAiPage() {
  const record = await prisma.globalConfig.findUniqueOrThrow({ where: { id: "global" } });
  const config = record.data as PrismaJson.GlobalConfigData;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ask AI Button</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Floating Ask AI button shown in the bottom-right corner of every public page. Opens
            an iframe panel pointing at the URL below.
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Global Config", href: "/admin/global" },
            { label: "Ask AI" },
          ]}
        />
      </div>

      <AskAiConfigForm config={config} />
    </div>
  );
}
