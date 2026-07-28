"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { RESOURCE_POSTS, FEATURED_NEWS } from "@/lib/resources-data";

const featured = RESOURCE_POSTS[0];

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

export function BlogsHeroSection() {
  return (
    <section className="pt-28 pb-16 lg:pt-32">
      <div className="container flex flex-col gap-14">
        <SimpleBreadcrumb current="Blogs" />

        {/* Featured post */}
        <div className="group flex flex-col lg:flex-row items-stretch rounded-lg overflow-hidden outline-1 -outline-offset-1 outline-neutral-200">
          <Link href={`/blogs/${featured.slug}`} className="relative w-full lg:w-157.5 h-64 lg:h-96 shrink-0">
            <Image src={featured.image} alt={featured.title} fill className="object-cover" />
            <span className="absolute top-4 right-4 size-10 rounded-full bg-red-600 flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300">
              <ArrowUpRight />
            </span>
          </Link>
          <div className="flex-1 p-8 flex flex-col justify-end gap-5">
            <div className="flex flex-col gap-5">
              <span className="text-neutral-400 text-sm font-semibold font-montserrat uppercase leading-5">
                {featured.date}
              </span>
              <h2 className="text-stone-900 text-lg font-medium font-montserrat leading-6">{featured.title}</h2>
            </div>
          </div>
        </div>

        {/* Blogs swiper */}
        <div className="flex flex-col lg:flex-row items-start gap-10">
          <div className="flex flex-col gap-5 shrink-0">
            <h3 className="w-64 text-gradient-orange-dark text-4xl font-normal font-montserrat leading-10">
              Blogs
            </h3>
            <div className="flex items-center gap-5">
              <button
                aria-label="Previous"
                className="news-prev size-10 rounded-full bg-orange-600/10 border flex items-center justify-center hover:bg-orange-600/20 transition-colors disabled:opacity-40"
              >
                <RotexArrow className="rotate-180" />
              </button>
              <button
                aria-label="Next"
                className="news-next size-10 rounded-full bg-orange-600/10 border flex items-center justify-center hover:bg-orange-600/20 transition-colors disabled:opacity-40"
              >
                <RotexArrow />
              </button>
            </div>
          </div>

          <Swiper
            modules={[Navigation, A11y]}
            spaceBetween={40}
            slidesPerView={1}
            breakpoints={{ 640: { slidesPerView: 2 } }}
            navigation={{ prevEl: ".news-prev", nextEl: ".news-next" }}
            className="flex-1 w-full pb-1!"
          >
            {FEATURED_NEWS.map((item) => (
              <SwiperSlide key={item.slug}>
                <div className="flex flex-col justify-between gap-6 h-full">
                  <h4 className="text-stone-900 text-lg font-medium font-montserrat leading-6 min-h-15">{item.title}</h4>
                  <Link
                    href={`/news-updates/${item.slug}`}
                    className="inline-flex items-center gap-1 text-orange-600 text-base font-medium font-montserrat leading-6"
                  >
                    <span>
                    Read more
                    </span>
                    <RotexArrow size={6}/>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
