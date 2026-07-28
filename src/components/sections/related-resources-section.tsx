import { ResourceCard } from "@/components/ui/resource-card";
import type { ResourcePost } from "@/lib/resources-data";

type RelatedResourcesSectionProps = {
  heading: string;
  posts: ResourcePost[];
  basePath: string;
};

export function RelatedResourcesSection({ heading, posts, basePath }: RelatedResourcesSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container flex flex-col gap-10">
        <h2 className="text-stone-900 text-3xl font-normal font-montserrat leading-10">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {posts.map((post) => (
            <ResourceCard key={post.slug} post={post} basePath={basePath} />
          ))}
        </div>
      </div>
    </section>
  );
}
