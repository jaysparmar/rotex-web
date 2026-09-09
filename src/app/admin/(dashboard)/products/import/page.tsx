import { Breadcrumb } from "@/components/admin/breadcrumb";
import { VariableImportWizard } from "@/components/admin/products/import/variable-import-wizard";
import { getCompanyCategoryTree, getIndustryTree } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export default async function AdminVariableProductImportPage() {
  const [companies, industries, downloadCategories] = await Promise.all([
    getCompanyCategoryTree(),
    getIndustryTree(),
    prisma.downloadCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bulk Import — Variable Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload an HTML export, map its columns to product fields and download links, then
            review and confirm.
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Products", href: "/admin/products" },
            { label: "Import" },
          ]}
        />
      </div>

      <VariableImportWizard companies={companies} industries={industries} downloadCategories={downloadCategories} />
    </div>
  );
}
