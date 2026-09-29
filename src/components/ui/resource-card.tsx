import Link from "next/link";
import { ImageView } from "@/components/ui/image-view";
import { getResourceTags, type ResourceItem } from "@/lib/resource-types";

type ResourceCardProps = {
  post: ResourceItem;
  basePath: string;
};

const VISIBLE_TAG_COUNT = 2;

export function ResourceCard({ post, basePath }: ResourceCardProps) {
  const tags = getResourceTags(post);
  const visibleTags = tags.slice(0, VISIBLE_TAG_COUNT);
  const remaining = tags.length - visibleTags.length;

  return (
    <Link href={`${basePath}/${post.slug}`} className="w-full flex flex-col gap-4 group">
      <ImageView
        fill
        src={post.image}
        alt={post.title}
        containerClassName="w-full h-56 rounded-lg"
        className="object-cover"
        unoptimized
      />
      <div className="min-h-8 flex items-center gap-1.5 flex-wrap">
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className="px-4 py-1 bg-white rounded-2xl outline-1 -outline-offset-1 outline-stone-300 text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5"
          >
            {tag}
          </span>
        ))}
        {remaining > 0 && (
          <span className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5">
            +{remaining} More
          </span>
        )}
      </div>
      <h3 className="line-clamp-3 min-h-18 text-stone-900 text-lg font-medium font-montserrat leading-6 group-hover:text-[#EF3E23] transition-colors">
        {post.title}
      </h3>
      <div className="mt-auto pt-2">
        <div className="h-px bg-neutral-200" />
      </div>
    </Link>
  );
}
