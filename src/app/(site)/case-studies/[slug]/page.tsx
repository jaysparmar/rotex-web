import { ResourceDetailPage } from "@/components/sections/resource-detail-page";

export default async function CaseStudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourceDetailPage type="case-studies" slug={slug} />;
}
