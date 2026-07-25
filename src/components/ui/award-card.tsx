import Link from "next/link";
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
  image?: StaticImageData | string;
  className?: string;
};

export function AwardCard({ slug, year, title, description, image, className }: AwardCardProps) {
  return (
    <Link
      href={`/about/awards/${slug}`}
      className={cn(
        "flex flex-col h-121.75 bg-stone-100 rounded-2xl outline outline-1 -outline-offset-1 outline-neutral-200",
        "shadow-[0px_3px_0px_0px_rgba(239,62,35,1)] overflow-hidden",
        className
      )}
    >
      {/* Image / placeholder */}
      <div className="relative w-full h-56 shrink-0 bg-stone-200 flex items-center justify-center">
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

        <span className="inline-flex w-fit items-center gap-2.5 px-5 py-3 bg-white rounded-full">
          <span className="text-orange-600 text-base font-medium font-montserrat leading-7">View Details</span>
          <RotexArrow size={8} />
        </span>
      </div>
    </Link>
  );
}
