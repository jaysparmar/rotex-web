import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/product-detail-data";
import { ProductDetailContent } from "@/components/sections/product-detail-content";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductDetail(slug);

  if (!product) notFound();

  return (
    <Suspense>
      <ProductDetailContent product={product} />
    </Suspense>
  );
}
