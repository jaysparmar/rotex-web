"use client";
import { useRef } from "react";
import { CustomerStoryCard } from "@/components/ui/customer-story-card";
import { RotexArrow } from "@/components/ui/rotex-arrow";

type Story = { id: string; quote: string; author: string; company: string; image: string; mediaType?: string };

type CustomerStoriesSectionProps = {
  heading?: { title: string; subtitle: string };
  stories?: Story[];
};

const defaultHeading = { title: "Customer Stories", subtitle: "Trusted across industries, proven in action" };

const defaultStories: Story[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&q=80",
    quote: "Rotex solutions have consistently improved our system reliability and reduced downtime significantly. Their engineering precision truly reflects in performance.",
    author: "Rajesh Mehta",
    company: "Plant Head, Aarti Industries Ltd.",
  },
];

const SCROLL_AMOUNT = 606; // card width (578) + gap (28)

export function CustomerStoriesSection({
  heading = defaultHeading,
  stories = defaultStories,
}: CustomerStoriesSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    const amount = firstCard ? firstCard.offsetWidth + gap : SCROLL_AMOUNT;
    track.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container">

        {/* Header */}
        <div className="flex flex-col gap-1.5 lg:flex-row lg:items-end lg:justify-between lg:gap-3 mb-8 lg:mb-10">
          <div className="flex flex-col gap-1.5 lg:gap-3">
            <h2 className="text-gradient-orange-dark font-montserrat font-normal text-2xl lg:text-4xl leading-8 lg:leading-10">
              {heading.title}
            </h2>
            <p className="text-stone-500 font-montserrat font-medium text-sm lg:text-base leading-5 lg:leading-6">
              {heading.subtitle}
            </p>
          </div>

          {/* Arrow nav — desktop */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous"
              className="size-10 rounded-full bg-orange-600/10 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150"
            >
              <RotexArrow size={7} className="rotate-180 text-red-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next"
              className="size-10 rounded-full bg-orange-600/10 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150"
            >
              <RotexArrow size={7} className="text-red-600" />
            </button>
          </div>
        </div>

        {/* Card track */}
        <div
          ref={trackRef}
          className="no-scrollbar flex gap-7 overflow-x-auto scroll-smooth snap-x snap-mandatory lg:snap-none"
          style={{ scrollbarWidth: "none" }}
        >
          {stories.map((story) => (
            <div key={story.id} className="w-full lg:w-auto shrink-0 snap-center">
              <CustomerStoryCard
                media={{ type: story.mediaType === "video" ? "video" : "image", src: story.image }}
                quote={story.quote}
                author={story.author}
                company={story.company}
              />
            </div>
          ))}
        </div>

        {/* Arrow nav — mobile */}
        <div className="flex lg:hidden items-center justify-center gap-3.5 mt-6">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous"
            className="size-10 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150"
          >
            <RotexArrow size={7} className="rotate-180 text-red-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            className="size-10 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150"
          >
            <RotexArrow size={7} className="text-red-600" />
          </button>
        </div>

      </div>
    </section>
  );
}
