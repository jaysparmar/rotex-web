import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ProductEditForm } from "@/components/admin/products/product-edit-form";
import { ProductDetailHeader } from "@/components/admin/products/product-detail-header";
import { VariantList } from "@/components/admin/products/variant-list";
import { getCompanyCategoryTree, getProductFamilyOptions } from "@/lib/products";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, companies, productFamilies, downloadCategories, certifications, industryOptions, subIndustryOptions] =
    await Promise.all([
      prisma.product.findUnique({
        where: { id },
        include: {
          company: { select: { name: true } },
          category: { select: { name: true } },
          variants: { orderBy: { createdAt: "asc" } },
          industries: { select: { id: true } },
          subIndustries: { select: { id: true } },
        },
      }),
      getCompanyCategoryTree(),
      getProductFamilyOptions(),
      prisma.downloadCategory.findMany({ orderBy: { name: "asc" } }),
      prisma.certification.findMany({ orderBy: { name: "asc" } }),
      prisma.industry.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.subIndustry.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);

  if (!product) notFound();

  // Keep the saved value selectable even if its Category was since renamed/deleted.
  const productFamilyOptions = productFamilies.includes(product.productFamily)
    ? productFamilies
    : [product.productFamily, ...productFamilies];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{product.modelNumber}</span>
            <Badge variant="outline">{product.productFamily}</Badge>
            <Badge variant="outline" className="capitalize">
              {product.productType}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Products", href: "/admin/products" },
              { label: product.name },
            ]}
          />
          <ProductDetailHeader id={product.id} name={product.name} modelNumber={product.modelNumber} slug={product.slug} />
        </div>
      </div>

      <ProductEditForm
        product={product}
        companies={companies}
        productFamilies={productFamilyOptions}
        downloadCategories={downloadCategories}
        certificationOptions={certifications.map((c) => c.name)}
        industryOptions={industryOptions}
        subIndustryOptions={subIndustryOptions}
      />

      {product.productType === "variable" && <VariantList productId={product.id} variants={product.variants} />}
    </div>
  );
}
