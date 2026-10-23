"use client";

import Image, { type ImageProps, type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { usePlaceholderImage } from "@/components/providers/placeholder-image-provider";
import logo from "@/assets/logo.svg";

type ImageViewProps = Omit<ImageProps, "src"> & {
  src: string | StaticImageData;
  containerClassName?: string;
};

function Placeholder() {
  const placeholder = usePlaceholderImage();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
      <Image src={placeholder || logo} alt="" width={80} height={28} className="grayscale opacity-30" />
    </div>
  );
}

export function ImageView({ src, alt, fill, className, containerClassName, ...props }: ImageViewProps) {
  const hasSrc = Boolean(src);

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden bg-stone-100", containerClassName)}>
        {hasSrc ? <Image src={src} alt={alt} fill className={cn("object-cover", className)} {...props} /> : <Placeholder />}
      </div>
    );
  }

  if (!hasSrc) return <Placeholder />;

  return <Image src={src} alt={alt} className={cn("object-contain", className)} {...props} />;
}
