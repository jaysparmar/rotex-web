import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { PostDetailSection } from "@/components/sections/post-detail-section";
import { RelatedResourcesSection } from "@/components/sections/related-resources-section";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";
import { prisma } from "@/lib/prisma";
import { createResourceTagResolver, type ResourceTagResolver } from "@/lib/resource-tags";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { resourceSeoKey } from "@/lib/seo-collections";
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
  csr: {
    label: "CSR",
    singular: "CSR",
    relatedHeading: "Related CSR",
    basePath: "/csr",
  },
};

export async function getResourceMetadata(type: ResourceType, slug: string): Promise<Metadata> {
  const resource = await prisma.resource.findUnique({ where: { type_slug: { type, slug } }, select: { title: true } });
  const fallback = resource ? { title: `${resource.title} | Rotex`, description: SITE_METADATA_FALLBACK.description } : SITE_METADATA_FALLBACK;
  return buildMetadata(await getPageSeo(resourceSeoKey(type, slug)), fallback);
}

function toResourceItem(
  r: {
    id: string;
    type: string;
    slug: string;
    title: string;
    image: string;
    gallery: unknown;
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
    gallery: (r.gallery as { url: string; size?: "wide" | "narrow" }[]) ?? [],
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

  const [record, resolver, seo] = await Promise.all([
    prisma.resource.findUnique({ where: { type_slug: { type, slug } } }),
    createResourceTagResolver(),
    getPageSeo(resourceSeoKey(type, slug)),
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
      <SeoJsonLd schema={seo.schema} />
      <ScrollToTop />
      <PostDetailSection post={post} typeLabel={label} typeSingular={singular} typeHref={basePath} />
      <RelatedResourcesSection heading={relatedHeading} posts={related} basePath={basePath} />
    </div>
  );
}
