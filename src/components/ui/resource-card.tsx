import Link from "next/link";
import { ImageView } from "@/components/ui/image-view";
import type { ResourceItem } from "@/lib/resource-types";

type ResourceCardProps = {
  post: ResourceItem;
  basePath: string;
};

export function ResourceCard({ post, basePath }: ResourceCardProps) {
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
      <div className="flex items-center gap-1.5 flex-wrap">
        {post.product && (
          <span className="px-4 py-1 bg-white rounded-2xl outline-1 -outline-offset-1 outline-stone-300 text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5">
            {post.product}
          </span>
        )}
        {post.industry && (
          <span className="px-4 py-1 bg-white rounded-2xl outline-1 -outline-offset-1 outline-stone-300 text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5">
            {post.industry}
          </span>
        )}
        {!!post.extraTags?.length && (
          <span className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5">
            +{post.extraTags.length} More
          </span>
        )}
      </div>
      <h3 className="text-stone-900 text-lg font-medium font-montserrat leading-6 group-hover:text-[#EF3E23] transition-colors">
        {post.title}
      </h3>
      <div className="pt-2">
        <div className="h-px bg-neutral-200" />
      </div>
    </Link>
  );
}
