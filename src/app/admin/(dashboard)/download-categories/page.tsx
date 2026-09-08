import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DownloadCategoryList } from "@/components/admin/download-categories/download-category-list";

export default async function AdminDownloadCategoriesPage() {
  const categories = await prisma.downloadCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Download Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the categories admins pick from when attaching a download to a product or variant.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Download Categories" }]} />
      </div>

      <DownloadCategoryList categories={categories} />
    </div>
  );
}
