import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/products-data";
import { ProductDetailContent } from "@/components/sections/product-detail-content";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { productSeoKey } from "@/lib/seo-collections";
import { getFormConfig } from "@/lib/form-config";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } });
  const fallback = product
    ? { title: `${product.name} | Rotex`, description: product.description || SITE_METADATA_FALLBACK.description }
    : SITE_METADATA_FALLBACK;
  return buildMetadata(await getPageSeo(productSeoKey(slug)), fallback);
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, seo, formConfig] = await Promise.all([
    getProductBySlug(slug),
    getPageSeo(productSeoKey(slug)),
    getFormConfig(),
  ]);

  if (!product) notFound();

  return (
    <Suspense>
      <SeoJsonLd schema={seo.schema} />
      <ProductDetailContent product={product} formConfig={formConfig["product-quote"].fields} />
    </Suspense>
  );
}
