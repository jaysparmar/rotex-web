"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { TabsNav } from "@/components/ui/tabs-nav";
import { ArticleCard } from "@/components/ui/article-card";
import { RotexArrow } from "@/components/ui/rotex-arrow";

type ResourceItem = { slug: string; title: string; image: string };
type ResourceTab = {
  id: string;
  label: string;
  cta: { label: string; href: string };
  resources: ResourceItem[];
};

type LearnSectionProps = {
  heading?: string;
  tabs?: ResourceTab[];
};

/* Tab ids don't all match their route segment (the "news" tab lives at /news-updates). */
const TAB_ROUTES: Record<string, string> = {
  "case-studies": "/case-studies",
  news: "/news-updates",
  blogs: "/blogs",
};

const tabRoute = (tabId: string) => TAB_ROUTES[tabId] ?? `/${tabId}`;

const defaultTabs: ResourceTab[] = [
  {
    id: "case-studies",
    label: "Case Studies",
    cta: { label: "Read All Case Studies", href: "/case-studies" },
    resources: [
      {
        slug: "solenoid-valve-classification",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
        title: "Solenoid Valve Classification: The Engineering Logic Behind Reliable Automation Systems",
      },
    ],
  },
];

export function LearnSection({ heading = "Resources", tabs = defaultTabs }: LearnSectionProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];
  const cards = activeTab?.resources ?? [];
  const trackRef = useRef<HTMLDivElement>(null);

  // Mobile arrows — step one card width (card + gap) at a time.
  const scrollByCard = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 14 : track.clientWidth;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-7 lg:py-20">
      <div className="container">

        {/* Heading — Figma mobile: 24px / leading-8 */}
        <h2 className="font-montserrat font-medium lg:font-normal text-2xl lg:text-4xl leading-8 lg:leading-10 mb-5 lg:mb-6">
          <span className="text-gradient-orange-dark">{heading}</span>
        </h2>

        {/* Tabs */}
        <TabsNav tabs={tabs} active={active} onChange={setActive} className="mb-8 lg:mb-10" />

        {/* Cards — horizontal swiper on mobile, 3-column grid on desktop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab?.id}
            ref={trackRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="no-scrollbar flex lg:grid lg:grid-cols-3 gap-3.5 lg:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory lg:snap-none -mx-5 px-5 lg:mx-0 lg:px-0"
            style={{ scrollbarWidth: "none" }}
          >
            {cards.map((card) => (
              <ArticleCard
                key={card.slug}
                image={card.image}
                title={card.title}
                href={`${tabRoute(activeTab.id)}/${card.slug}`}
                className="w-64 shrink-0 snap-center lg:w-auto"
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Carousel arrows — mobile only (desktop shows all three cards at once) */}
        <div className="flex lg:hidden justify-center items-center gap-3.5 mt-8">
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Previous"
            className="size-10 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150"
          >
            <RotexArrow size={7} className="rotate-180 text-red-600" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Next"
            className="size-10 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150"
          >
            <RotexArrow size={7} className="text-red-600" />
          </button>
        </div>

        {/* CTA — full width on mobile (Figma: h-12, rounded-[100px]) */}
        {activeTab?.cta && (
          <div className="flex justify-center mt-10 lg:mt-14">
            <Link
              href={tabRoute(activeTab.id)}
              className="w-full lg:w-auto h-12 lg:h-auto inline-flex justify-center items-center gap-3.5 px-6 lg:py-3.5 rounded-[100px] bg-stone-900 text-white font-montserrat font-semibold text-sm uppercase leading-5 hover:bg-primary transition-colors duration-150"
            >
              {activeTab.cta.label}
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
