import Image from "next/image";
import type { StaticImageData } from "next/image";
import { Award } from "lucide-react";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { cn } from "@/lib/utils";

export type AwardCardProps = {
  slug: string;
  year: string;
  title: string;
  description: string;
  /* Third-party page for this award — opens in a new tab. */
  url?: string;
  image?: StaticImageData | string;
  className?: string;
};

export function AwardCard({ year, title, description, url, image, className }: AwardCardProps) {
  const body = (
    <>
      {/* Image / placeholder */}
      <div className="relative w-full h-56 shrink-0 bg-stone-200 flex items-center justify-center overflow-hidden">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover" sizes="400px" />
        ) : (
          <Award className="size-12 text-stone-300" strokeWidth={1.5} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between gap-3 px-8 py-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="text-stone-500 text-sm font-medium font-montserrat leading-5">{year}</p>
            <h3 className="text-red-600 text-xl font-semibold font-montserrat leading-7">{title}</h3>
          </div>
          <p className="text-stone-900 text-sm font-medium font-montserrat leading-6">{description}</p>
        </div>

        <span className="inline-flex w-fit items-center gap-2.5 px-5 py-3 bg-white rounded-[45px] transition-colors duration-200 group-hover:bg-[#EF3E23]">
          <span className="text-[#EF3E23] text-base font-medium font-montserrat leading-7 transition-colors duration-200 group-hover:text-white">
            View Details
          </span>
          <RotexArrow size={8} color="currentColor" className="text-[#EF3E23] transition-colors duration-200 group-hover:text-white" />
        </span>
      </div>
    </>
  );

  /* The red under-stroke is a hover-only accent. It's always a 3px bottom border
     so the card never changes height — it just starts out transparent.
     Hover also tints the card stone-100 → rose-100 and inverts the pill to red. */
  const shell = cn(
    "group flex flex-col h-121.75 bg-stone-100 rounded-2xl overflow-hidden",
    "border border-neutral-200 border-b-[3px] border-b-transparent",
    "transition-colors duration-200 hover:bg-rose-100 hover:border-b-[#EE3E23]",
    className
  );

  // With no third-party URL there is nowhere to send the visitor, so the card
  // renders as static content instead of linking to a route that doesn't exist.
  if (!url) return <div className={shell}>{body}</div>;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={shell}>
      {body}
    </a>
  );
}
