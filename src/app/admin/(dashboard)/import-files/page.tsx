import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ImportFileManager } from "@/components/admin/import-file-manager";

export default function AdminImportFilesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Import Files</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Files on the server for bulk imports — for example, the zip of variant photos used by the product
            import&apos;s &quot;Choose from server&quot; option.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Import Files" }]} />
      </div>
      <ImportFileManager />
    </div>
  );
}
