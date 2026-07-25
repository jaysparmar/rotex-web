"use client";
import { useRef, useState } from "react";
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

type GalleryImage = { src: StaticImageData; alt: string; size: "wide" | "narrow" };

const defaultImages: GalleryImage[] = [
  { src: railBg, alt: "Rotex team at the manufacturing facility", size: "wide" },
  { src: growthImage, alt: "Precision machining on the factory floor", size: "narrow" },
  { src: machineBg, alt: "Rotex team at the manufacturing facility", size: "wide" },
  { src: oilBg, alt: "Valve testing on the shop floor", size: "narrow" },
];

type CareerGallerySectionProps = {
  images?: GalleryImage[];
};

export function CareerGallerySection({ images = defaultImages }: CareerGallerySectionProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <div className="relative">
          <Swiper
            modules={[Navigation, A11y]}
            spaceBetween={20}
            slidesPerView="auto"
            className="!overflow-visible"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
          >
            {images.map((img, i) => (
              <SwiperSlide key={i} className={img.size === "wide" ? "!w-[70%] lg:!w-[55%]" : "!w-[38%] lg:!w-[27%]"}>
                <div className="relative h-64 lg:h-96 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 55vw, 70vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            aria-label="Previous photo"
            disabled={isBeginning}
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-stone-200 transition-opacity hover:bg-stone-50 disabled:opacity-40 lg:-left-6"
          >
            <RotexArrow className="rotate-180" size={9} />
          </button>
          <button
            aria-label="Next photo"
            disabled={isEnd}
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-stone-200 transition-opacity hover:bg-stone-50 disabled:opacity-40 lg:-right-6"
          >
            <RotexArrow size={9} />
          </button>
        </div>
      </div>
    </section>
  );
}
