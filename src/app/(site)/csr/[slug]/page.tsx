import type { Metadata } from "next";
import { ResourceDetailPage, getResourceMetadata } from "@/components/sections/resource-detail-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return getResourceMetadata("csr", slug);
}

export default async function CsrDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ResourceDetailPage type="csr" slug={slug} />;
}
