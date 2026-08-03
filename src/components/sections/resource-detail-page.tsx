import { notFound } from "next/navigation";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { PostDetailSection } from "@/components/sections/post-detail-section";
import { RelatedResourcesSection } from "@/components/sections/related-resources-section";
import { RESOURCE_POSTS, FEATURED_NEWS, type ResourcePost } from "@/lib/resources-data";

/*
  One detail page serves every resource type. Cards elsewhere on the site are fed
  by CMS records whose slugs don't exist in RESOURCE_POSTS yet, so an unknown slug
  falls back to the first post's body rather than 404-ing. Replace the fallback
  once each resource carries its own content.
*/
function findPost(slug: string): ResourcePost {
  const post = RESOURCE_POSTS.find((p) => p.slug === slug);
  if (post) return post;

  const news = FEATURED_NEWS.find((n) => n.slug === slug);
  if (news) {
    return {
      ...RESOURCE_POSTS[0],
      slug: news.slug,
      title: news.title,
      date: news.date,
      product: "Solenoid Valve",
      industry: "Automotive",
    };
  }

  return { ...RESOURCE_POSTS[0], slug };
}

type ResourceType = "blogs" | "news-updates" | "case-studies";

const TYPE_CONFIG: Record<ResourceType, { label: string; singular: string; relatedHeading: string }> = {
  blogs: { label: "Blogs", singular: "Blog", relatedHeading: "Related Blogs" },
  "news-updates": { label: "News & Updates", singular: "News & Update", relatedHeading: "Related News & Updates" },
  "case-studies": { label: "Case Studies", singular: "Case Study", relatedHeading: "Related Case Studies" },
};

type ResourceDetailPageProps = {
  type: ResourceType;
  slug: string;
};

export function ResourceDetailPage({ type, slug }: ResourceDetailPageProps) {
  if (!TYPE_CONFIG[type]) notFound();

  const post = findPost(slug);
  const { label, singular, relatedHeading } = TYPE_CONFIG[type];
  const basePath = `/${type}`;
  const related = RESOURCE_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div>
      <ScrollToTop />
      <PostDetailSection post={post} typeLabel={label} typeSingular={singular} typeHref={basePath} />
      <RelatedResourcesSection heading={relatedHeading} posts={related} basePath={basePath} />
    </div>
  );
}
