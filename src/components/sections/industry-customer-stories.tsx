"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { CustomerStoryCard } from "@/components/ui/customer-story-card";
import { RotexArrow } from "@/components/ui/rotex-arrow";

type CustomerStory = { quote: string; author: string; company: string; image: string; mediaType?: string };

type Props = {
  stories: CustomerStory[];
};

export function IndustryCustomerStories({ stories }: Props) {
  if (!stories.length) return null;

  return (
    <section className="bg-white pt-10 lg:pt-16 pb-14 lg:pb-24 border-t border-stone-100">
      <div className="container flex flex-col gap-8 lg:gap-10">
        <div className="flex items-center justify-between">
          <h3 className="text-stone-900 text-xl lg:text-2xl font-medium font-montserrat leading-7 lg:leading-8">
            Customer Stories
          </h3>
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7">
            <button className="cs-prev size-10 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150">
              <RotexArrow size={7} className="rotate-180 text-[#EF3E23]" />
            </button>
            <button className="cs-next size-10 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150">
              <RotexArrow size={7} className="text-[#EF3E23]" />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={16}
          slidesPerView="auto"
          navigation={{ prevEl: ".cs-prev", nextEl: ".cs-next" }}
          className="!pb-2 w-full"
        >
          {stories.map((story, i) => (
            <SwiperSlide key={i} className="!w-[85vw] lg:!w-[578px]">
              <CustomerStoryCard
                media={{ type: story.mediaType === "video" ? "video" : "image", src: story.image }}
                quote={story.quote}
                author={story.author}
                company={story.company}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Mobile nav */}
        <div className="flex lg:hidden items-center justify-center gap-4">
          <button className="cs-prev size-9 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150">
            <RotexArrow size={6} className="rotate-180 text-[#EF3E23]" />
          </button>
          <button className="cs-next size-9 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150">
            <RotexArrow size={6} className="text-[#EF3E23]" />
          </button>
        </div>
      </div>
    </section>
  );
}
