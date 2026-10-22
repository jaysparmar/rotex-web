import { ResourceDetailPage } from "@/components/sections/resource-detail-page";

export default async function CsrDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourceDetailPage type="csr" slug={slug} />;
}
