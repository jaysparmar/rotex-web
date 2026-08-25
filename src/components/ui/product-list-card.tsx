import Link from "next/link";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { productHref } from "@/lib/breadcrumb";

export type ProductListCardProps = {
  slug: string;
  code: string;
  name: string;
  category: string;
  image: StaticImageData | string;
  tags?: string[];
};

export function ProductListCard({ slug, code, name, category, image, tags = [] }: ProductListCardProps) {
  return (
    <Link
      href={productHref(slug, category)}
      className="group w-full h-96 p-5 bg-white hover:bg-stone-50 rounded-2xl outline outline-1 -outline-offset-1 outline-neutral-200 hover:outline-primary flex flex-col justify-between items-start shadow-[0px_2px_0px_0px_rgba(229,229,229,1)] hover:shadow-[0px_4px_0px_0px_rgba(239,62,35,1)] hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Top: category badge + product image */}
      <div className="flex flex-col gap-5 items-start">
        <span className="px-5 py-1 bg-white rounded-full outline outline-1 -outline-offset-1 outline-neutral-200 text-stone-900 text-xs font-semibold font-montserrat leading-6">
          {category}
        </span>
        <div className="w-64 h-48 relative overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain"
            sizes="256px"
          />
        </div>
      </div>

      {/* Bottom: code + name + tags */}
      <div className="self-stretch flex flex-col gap-1.5">
        <p className="text-red-600 text-sm font-medium font-montserrat leading-5">{code}</p>
        <p className="text-stone-900 group-hover:text-gradient-orange-dark text-lg font-medium font-montserrat leading-6">
          {name}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-0.5 bg-white rounded-full outline outline-1 -outline-offset-1 outline-neutral-200 text-stone-900 text-xs font-medium font-montserrat leading-5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
