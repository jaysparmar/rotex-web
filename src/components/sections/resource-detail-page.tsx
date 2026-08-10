import { notFound } from "next/navigation";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { PostDetailSection } from "@/components/sections/post-detail-section";
import { RelatedResourcesSection } from "@/components/sections/related-resources-section";
import { prisma } from "@/lib/prisma";
import type { ResourceItem, ResourceType } from "@/lib/resource-types";

const TYPE_CONFIG: Record<ResourceType, { label: string; singular: string; relatedHeading: string; basePath: string }> = {
  blogs: { label: "Blogs", singular: "Blog", relatedHeading: "Related Blogs", basePath: "/blogs" },
  news: {
    label: "News & Updates",
    singular: "News & Update",
    relatedHeading: "Related News & Updates",
    basePath: "/news-updates",
  },
  "case-studies": {
    label: "Case Studies",
    singular: "Case Study",
    relatedHeading: "Related Case Studies",
    basePath: "/case-studies",
  },
};

function toResourceItem(r: {
  id: string;
  type: string;
  slug: string;
  title: string;
  image: string;
  product: string;
  industry: string;
  extraTags: unknown;
  content: string;
  createdAt: Date;
}): ResourceItem {
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    image: r.image,
    product: r.product,
    industry: r.industry,
    extraTags: (r.extraTags as string[]) ?? [],
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  };
}

type ResourceDetailPageProps = {
  type: ResourceType;
  slug: string;
};

export async function ResourceDetailPage({ type, slug }: ResourceDetailPageProps) {
  if (!TYPE_CONFIG[type]) notFound();

  const record = await prisma.resource.findUnique({ where: { type_slug: { type, slug } } });
  if (!record || !record.published) notFound();

  const post = toResourceItem(record);
  const { label, singular, relatedHeading, basePath } = TYPE_CONFIG[type];

  const relatedRecords = await prisma.resource.findMany({
    where: { type, published: true, slug: { not: slug } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const related = relatedRecords.map(toResourceItem);

  return (
    <div>
      <ScrollToTop />
      <PostDetailSection post={post} typeLabel={label} typeSingular={singular} typeHref={basePath} />
      <RelatedResourcesSection heading={relatedHeading} posts={related} basePath={basePath} />
    </div>
  );
}
