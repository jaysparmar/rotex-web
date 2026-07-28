import { notFound } from "next/navigation";
import { PostDetailSection } from "@/components/sections/post-detail-section";
import { RelatedResourcesSection } from "@/components/sections/related-resources-section";
import { RESOURCE_POSTS, FEATURED_NEWS, type ResourcePost } from "@/lib/resources-data";

function findPost(slug: string): ResourcePost | undefined {
  const post = RESOURCE_POSTS.find((p) => p.slug === slug);
  if (post) return post;

  const news = FEATURED_NEWS.find((n) => n.slug === slug);
  if (!news) return undefined;
  return {
    slug: news.slug,
    title: news.title,
    image: RESOURCE_POSTS[0].image,
    date: news.date,
    product: "Solenoid Valve",
    industry: "Automotive",
  };
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
  const post = findPost(slug);
  if (!post) notFound();

  const { label, singular, relatedHeading } = TYPE_CONFIG[type];
  const basePath = `/${type}`;
  const related = RESOURCE_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div>
      <PostDetailSection post={post} typeLabel={label} typeSingular={singular} typeHref={basePath} />
      <RelatedResourcesSection heading={relatedHeading} posts={related} basePath={basePath} />
    </div>
  );
}
