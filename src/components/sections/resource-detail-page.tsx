import { notFound } from "next/navigation";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { PostDetailSection } from "@/components/sections/post-detail-section";
import { RelatedResourcesSection } from "@/components/sections/related-resources-section";
import { prisma } from "@/lib/prisma";
import { createResourceTagResolver, type ResourceTagResolver } from "@/lib/resource-tags";
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

function toResourceItem(
  r: {
    id: string;
    type: string;
    slug: string;
    title: string;
    image: string;
    productIds: unknown;
    industryIds: unknown;
    extraTags: unknown;
    content: string;
    createdAt: Date;
  },
  resolver: ResourceTagResolver
): ResourceItem {
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    image: r.image,
    products: resolver.resolveProducts((r.productIds as string[]) ?? []),
    industries: resolver.resolveIndustries((r.industryIds as string[]) ?? []),
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

  const [record, resolver] = await Promise.all([
    prisma.resource.findUnique({ where: { type_slug: { type, slug } } }),
    createResourceTagResolver(),
  ]);
  if (!record || !record.published) notFound();

  const post = toResourceItem(record, resolver);
  const { label, singular, relatedHeading, basePath } = TYPE_CONFIG[type];

  // No admin fallback to "latest 3" — the Related section only shows what was
  // explicitly picked in the admin, and stays hidden entirely when nothing was.
  const relatedIds = (record.relatedIds as string[]) ?? [];
  const relatedRecords =
    relatedIds.length > 0
      ? await prisma.resource.findMany({ where: { id: { in: relatedIds }, published: true } }).then((records) => {
          // Preserve the admin's picked order, not the DB's.
          const byId = new Map(records.map((r) => [r.id, r]));
          return relatedIds.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
        })
      : [];
  const related = relatedRecords.map((r) => toResourceItem(r, resolver));

  return (
    <div>
      <ScrollToTop />
      <PostDetailSection post={post} typeLabel={label} typeSingular={singular} typeHref={basePath} />
      <RelatedResourcesSection heading={relatedHeading} posts={related} basePath={basePath} />
    </div>
  );
}
