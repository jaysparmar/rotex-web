import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DownloadList } from "@/components/admin/downloads/download-list";

export default async function AdminDownloadsPage() {
  const items = await prisma.downloadItem.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Downloads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage certificates, manuals, brochures, and catalogues shown on the Downloads page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Downloads" }]} />
      </div>

      <DownloadList items={items} />
    </div>
  );
}
