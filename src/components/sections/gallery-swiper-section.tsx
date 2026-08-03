"use client";
import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import growthImage from "@/assets/Images/aboutus/growth.png";
import machineBg from "@/assets/Images/breadcurmbBackgrounds/machine_bg.jpg";
import railBg from "@/assets/Images/breadcurmbBackgrounds/rail_bg.jpg";
import oilBg from "@/assets/Images/breadcurmbBackgrounds/oil_bg.jpg";
import aerospaceBg from "@/assets/Images/breadcurmbBackgrounds/aerospace_bg.jpg";

type GalleryImage = { src: StaticImageData; alt: string };

const defaultImages: GalleryImage[] = [
  { src: railBg, alt: "Rotex team at the manufacturing facility" },
  { src: growthImage, alt: "Precision machining on the factory floor" },
  { src: machineBg, alt: "Rotex team at the manufacturing facility" },
  { src: oilBg, alt: "Valve testing on the shop floor" },
  { src: aerospaceBg, alt: "Assembly line at Rotex facility" },
];

type GallerySwiperSectionProps = {
  images?: GalleryImage[];
};

export function GallerySwiperSection({ images = defaultImages }: GallerySwiperSectionProps) {
  const swiperRef = useRef<SwiperClass | null>(null);

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <div className="relative">
          {/* No centeredSlides — the first image sits flush with the container's
              left edge on load; loop keeps it cycling in both directions. */}
          <Swiper
            modules={[Navigation, A11y]}
            loop
            spaceBetween={20}
            slidesPerView={1.08}
            breakpoints={{
              768: { slidesPerView: 1.3, spaceBetween: 28 },
              1024: { slidesPerView: 1.6, spaceBetween: 32 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="!overflow-visible"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 60vw, (min-width: 768px) 75vw, 90vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Always enabled — looping means there is no first or last slide */}
          <button
            aria-label="Previous photo"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-stone-200 transition-colors hover:bg-stone-50 lg:left-6"
          >
            <RotexArrow className="rotate-180" size={9} />
          </button>
          <button
            aria-label="Next photo"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-stone-200 transition-colors hover:bg-stone-50 lg:right-6"
          >
            <RotexArrow size={9} />
          </button>
        </div>
      </div>
    </section>
  );
}
