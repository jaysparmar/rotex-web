import Link from "next/link";
import { ImageView } from "@/components/ui/image-view";
import { cn } from "@/lib/utils";
import type { StaticImageData } from "next/image";

type ArticleCardProps = {
  image: string | StaticImageData;
  title: string;
  href: string;
  className?: string;
};

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.5 12.5L12.5 1.5M12.5 1.5H5M12.5 1.5V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArticleCard({ image, title, href, className }: ArticleCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        // Mobile has no hover, so it rests in the Figma "active" look: stone-100
        // fill, orange bottom stroke, dark arrow. Desktop rests plain and
        // transitions into that look on hover.
        "group flex flex-col rounded-xl lg:rounded-[20px] overflow-hidden bg-stone-100 lg:bg-white outline-1 -outline-offset-1 outline-stone-200",
        "border-b-[2.62px] border-orange-600 lg:border-b-4 lg:border-transparent transition-colors duration-200",
        "lg:hover:bg-stone-100 lg:hover:border-orange-600",
        className
      )}
    >
      {/* Square image with arrow button at top-right */}
      <div className="relative aspect-square w-full">
        <ImageView
          fill
          src={image}
          alt={title}
          containerClassName="w-full h-full"
          className="object-cover"
        />
        <div className="absolute top-4 right-4 size-10 rounded-full bg-stone-900 text-white lg:bg-white lg:text-stone-800 flex items-center justify-center shadow-sm lg:group-hover:bg-stone-900 lg:group-hover:text-white transition-colors duration-200">
          <ArrowUpRight />
        </div>
      </div>

      {/* Title below image — Figma mobile: 14px / leading-5 */}
      <div className="px-4 pt-3.5 pb-4 lg:px-6 lg:pt-4 lg:pb-6">
        <h3 className="text-stone-900 font-montserrat font-medium text-sm lg:text-base leading-5 lg:leading-6">
          {title}
        </h3>
      </div>
    </Link>
  );
}
