import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DownloadImportWizard } from "@/components/admin/download-categories/import/download-import-wizard";

export default async function AdminDownloadImportPage() {
  const categories = await prisma.downloadCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bulk Import — Downloads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a Google Sheets HTML export, map its Downloads columns, then review and confirm.
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Download Categories", href: "/admin/download-categories" },
            { label: "Import" },
          ]}
        />
      </div>

      <DownloadImportWizard categories={categories} />
    </div>
  );
}
