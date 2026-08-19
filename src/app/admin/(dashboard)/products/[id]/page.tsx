import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ProductEditForm } from "@/components/admin/products/product-edit-form";
import { ProductDetailHeader } from "@/components/admin/products/product-detail-header";
import { VariantList } from "@/components/admin/products/variant-list";
import { getCompanyCategoryTree, getIndustryTree } from "@/lib/products";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, companies, industries] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        company: { select: { name: true } },
        category: { select: { name: true } },
        variants: { orderBy: { createdAt: "asc" } },
      },
    }),
    getCompanyCategoryTree(),
    getIndustryTree(),
  ]);

  if (!product) notFound();

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
          <ProductDetailHeader id={product.id} name={product.name} modelNumber={product.modelNumber} />
        </div>
      </div>

      <ProductEditForm product={product} companies={companies} industries={industries} />

      {product.productType === "variable" && <VariantList productId={product.id} variants={product.variants} />}
    </div>
  );
}
