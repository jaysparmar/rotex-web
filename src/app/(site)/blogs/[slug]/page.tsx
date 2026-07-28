import { ResourceDetailPage } from "@/components/sections/resource-detail-page";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourceDetailPage type="blogs" slug={slug} />;
}
