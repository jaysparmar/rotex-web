import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products-data";
import { ProductDetailContent } from "@/components/sections/product-detail-content";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <Suspense>
      <ProductDetailContent product={product} />
    </Suspense>
  );
}
