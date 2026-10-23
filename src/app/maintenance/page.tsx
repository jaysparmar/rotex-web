import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const record = await prisma.globalConfig.findUnique({ where: { id: "global" } });
  const config = record?.data as PrismaJson.GlobalConfigData | undefined;
  const maintenance = config?.maintenance;

  const title = maintenance?.title?.trim() || "We'll be right back";
  const message =
    maintenance?.message?.trim() || "Rotex is undergoing scheduled maintenance. Please check back shortly.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-900 px-6 text-center text-zinc-50">
      {config?.logo?.src ? (
        <div className="rounded-xl bg-white/5 px-6 py-4 backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.logo.src} alt={config.logo.alt || "Rotex"} className="h-9 w-auto" />
        </div>
      ) : (
        <span className="text-xl font-bold tracking-tight">ROTEX</span>
      )}

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mx-auto max-w-md text-sm text-zinc-400 sm:text-base">{message}</p>
      </div>
    </div>
  );
}
