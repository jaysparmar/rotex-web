"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, alt }: { images: (StaticImageData | string)[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const showArrows = images.length > 1;

  const goTo = (dir: -1 | 1) => {
    setActiveIndex((prev) => (prev + dir + images.length) % images.length);
  };

  const selectImage = (i: number) => {
    setActiveIndex(i);
  };

  return (
    <div className="w-full aspect-square lg:aspect-[630/530] max-w-158 rounded-2xl lg:rounded-3xl relative">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl lg:rounded-3xl">
        <Image src={images[activeIndex]} alt={alt} fill className="object-contain" sizes="630px" />
      </div>

      {/* Thumbnails */}
      {showArrows && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => goTo(-1)}
            aria-label="Previous image"
            className="size-8 flex items-center justify-center text-neutral-400 hover:text-stone-900 border rounded-full bg-white border-neutral-500 hover:border-stone-900 transition-colors"
          >
            <IoChevronBackOutline size={16} />
          </button>

          <div className="flex items-center gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectImage(i)}
                className={cn(
                  "w-16 h-20 relative rounded-lg overflow-hidden border bg-white",
                  i === activeIndex ? "border-stone-900" : "border-transparent"
                )}
              >
                <Image src={img} alt="" fill className="object-contain p-1.5" sizes="64px" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(1)}
            aria-label="Next image"
            className="size-8 flex items-center justify-center text-neutral-400 hover:text-stone-900 border rounded-full bg-white border-neutral-500 hover:border-stone-900 transition-colors"
          >
            <IoChevronForwardOutline size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
