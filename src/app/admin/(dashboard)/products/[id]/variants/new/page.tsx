import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { VariantEditForm } from "@/components/admin/products/variant-edit-form";
import { getAttributeValuesByKey } from "@/lib/products";

export default async function AdminNewVariantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, attributeValues, downloadCategories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, select: { id: true, name: true } }),
    getAttributeValuesByKey(),
    prisma.downloadCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Variant</h1>
          <p className="mt-1 text-sm text-muted-foreground">Under {product.name}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Products", href: "/admin/products" },
            { label: product.name, href: `/admin/products/${product.id}` },
            { label: "New Variant" },
          ]}
        />
      </div>

      <VariantEditForm
        productId={product.id}
        productName={product.name}
        attributeValues={attributeValues}
        downloadCategories={downloadCategories}
      />
    </div>
  );
}
