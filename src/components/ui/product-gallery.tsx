"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { IoChevronBackOutline, IoChevronForwardOutline, IoAddOutline, IoRemoveOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.5;

export function ProductGallery({ images, alt }: { images: (StaticImageData | string)[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(ZOOM_MIN);

  const showArrows = images.length > 1;

  const goTo = (dir: -1 | 1) => {
    setActiveIndex((prev) => (prev + dir + images.length) % images.length);
    setZoom(ZOOM_MIN);
  };

  const selectImage = (i: number) => {
    setActiveIndex(i);
    setZoom(ZOOM_MIN);
  };

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));

  return (
    <div className="w-full aspect-square lg:aspect-[630/530] max-w-158 bg-neutral-100 rounded-2xl lg:rounded-3xl relative">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl p-14 lg:rounded-3xl">
        <div
          className="relative w-full h-full transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <Image src={images[activeIndex]} alt={alt} fill className="object-contain" sizes="630px" />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          aria-label="Zoom in"
          className="size-8 flex items-center justify-center rounded-md bg-white border border-neutral-200 text-stone-500 hover:text-stone-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <IoAddOutline size={16} />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          aria-label="Zoom out"
          className="size-8 flex items-center justify-center rounded-md bg-white border border-neutral-200 text-stone-500 hover:text-stone-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <IoRemoveOutline size={16} />
        </button>
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
