import { ResourceDetailPage } from "@/components/sections/resource-detail-page";

export default async function NewsUpdateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourceDetailPage type="news-updates" slug={slug} />;
}
