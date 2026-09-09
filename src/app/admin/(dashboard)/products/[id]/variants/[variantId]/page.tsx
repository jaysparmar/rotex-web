import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { VariantEditForm } from "@/components/admin/products/variant-edit-form";
import { getAttributeValuesByKey } from "@/lib/products";

export default async function AdminVariantDetailPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id, variantId } = await params;

  const [product, variant, attributeValues, downloadCategories, certifications, industryOptions, subIndustryOptions] =
    await Promise.all([
      prisma.product.findUnique({ where: { id }, select: { id: true, name: true } }),
      prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { industries: { select: { id: true } }, subIndustries: { select: { id: true } } },
      }),
      getAttributeValuesByKey(),
      prisma.downloadCategory.findMany({ orderBy: { name: "asc" } }),
      prisma.certification.findMany({ orderBy: { name: "asc" } }),
      prisma.industry.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.subIndustry.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);
  if (!product) notFound();
  if (!variant || variant.productId !== product.id) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Variant</h1>
          <p className="mt-1 text-sm text-muted-foreground">Under {product.name}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Products", href: "/admin/products" },
            { label: product.name, href: `/admin/products/${product.id}` },
            { label: "Edit Variant" },
          ]}
        />
      </div>

      <VariantEditForm
        productId={product.id}
        productName={product.name}
        variant={variant}
        attributeValues={attributeValues}
        downloadCategories={downloadCategories}
        certificationOptions={certifications.map((c) => c.name)}
        industryOptions={industryOptions}
        subIndustryOptions={subIndustryOptions}
      />
    </div>
  );
}
