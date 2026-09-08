import Link from "next/link";
import { ImageView } from "@/components/ui/image-view";
import { cn } from "@/lib/utils";
import type { StaticImageData } from "next/image";

type ProductCardProps = {
  name: string;
  description: string;
  image: string | StaticImageData;
  href: string;
  className?: string;
};

export function ProductCard({ name, description, image, href, className }: ProductCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col shrink-0 w-72 p-5 rounded-2xl bg-stone-100 items-center gap-5",
        "shadow-[0px_4px_0px_0px_rgba(239,62,35,1)] outline outline-1 outline-offset-[-1px] outline-stone-100",
        "hover:-translate-y-1 transition-transform duration-200",
        className
      )}
    >
      {/* Product image */}
      <div className="w-64 h-48 overflow-hidden relative rounded-sm">
        <ImageView
          src={image}
          alt={name}
          fill
          containerClassName="w-full h-full"
          className="object-contain object-center"
        />
      </div>

      {/* Text */}
      <div className="self-stretch flex flex-col items-center gap-1.5">
        <h3 className="self-stretch text-center text-[#EF3E23] font-montserrat font-semibold text-xl leading-6">
          {name}
        </h3>
        <p className="w-56 text-center text-black font-montserrat font-medium text-base leading-6">
          {description}
        </p>
      </div>
    </Link>
  );
}
