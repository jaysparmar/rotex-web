import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ProductEditForm } from "@/components/admin/products/product-edit-form";
import { prisma } from "@/lib/prisma";
import { getCompanyCategoryTree, getIndustryTree } from "@/lib/products";

export default async function AdminNewProductPage() {
  const [companies, industries, downloadCategories] = await Promise.all([
    getCompanyCategoryTree(),
    getIndustryTree(),
    prisma.downloadCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Product</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a new product to the catalog.</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Products", href: "/admin/products" },
            { label: "New" },
          ]}
        />
      </div>

      <ProductEditForm companies={companies} industries={industries} downloadCategories={downloadCategories} />
    </div>
  );
}
