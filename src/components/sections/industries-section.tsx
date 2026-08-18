"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ImageView } from "@/components/ui/image-view";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { cn } from "@/lib/utils";

type Industry = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  mobileImage?: string | null;
};

type IndustriesSectionProps = {
  heading: { title: string; subtitle: string };
  industries: Industry[];
};

/* Figma: 24×24, 1.5px round-capped strokes in #201D1D — minus when open, plus when closed */
function ToggleIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M20 12H4" stroke="#201D1D" strokeWidth="1.5" strokeLinecap="round" />
      {!open && <path d="M12 4V20" stroke="#201D1D" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  );
}

export function IndustriesSection({ heading, industries }: IndustriesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!heading || !industries?.length) return null;

  const active = industries[activeIndex] ?? industries[0];

  return (
    <section className="bg-zinc-100 py-14 lg:py-28">
      <div className="container   ">

        {/* Heading + subtext — Figma mobile: black, font-medium, 24px/leading-8 */}
        <div className="flex flex-col gap-3 mb-11 lg:hidden">
          <h2 className="text-stone-900 font-montserrat font-medium leading-8 text-2xl">
            {heading.title}
          </h2>
          <p className="text-stone-500 text-sm font-medium font-montserrat leading-5">
            {heading.subtitle}
          </p>
        </div>

        {/* ── MOBILE: accordion ── */}
        <div className="flex flex-col lg:hidden">
          {industries.map((industry, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={industry.id} className="border-b border-stone-300">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 py-5 text-left text-stone-900 font-montserrat font-medium text-xl leading-8"
                >
                  {industry.name}
                  <ToggleIcon open={isOpen} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      {/* Figma: image, then the copy in black, then the button — stacked */}
                      <div className="pb-5 flex flex-col gap-4">
                        <div className="relative rounded-xl overflow-hidden aspect-334/224">
                          {industry.mobileImage && (
                            <ImageView
                              fill
                              src={industry.mobileImage}
                              alt={industry.name}
                              containerClassName="w-full h-full md:hidden"
                              className="object-cover"
                            />
                          )}
                          <ImageView
                            fill
                            src={industry.image}
                            alt={industry.name}
                            containerClassName={cn("w-full h-full", industry.mobileImage && "hidden md:block")}
                            className="object-cover"
                          />
                        </div>

                        <p className="text-stone-900 text-sm font-medium font-montserrat leading-5">
                          {industry.description}
                        </p>

                        <Link
                          href={`/industries/${industry.slug}`}
                          className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-[45px] bg-white text-primary font-montserrat font-medium text-base leading-7 hover:bg-primary hover:text-white transition-colors duration-150"
                        >
                          Explore
                          <RotexArrow size={8} color="currentColor" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── DESKTOP: tabs + image ── */}
        <div className="hidden lg:flex gap-5 items-start">

          {/* ── LEFT: heading + tabs ── */}
          <div className="w-96 shrink-0 flex flex-col justify-between self-stretch">
            <div className="flex flex-col gap-2">
              <h2 className="text-gradient-orange-dark font-montserrat font-normal leading-10 text-4xl">
                {heading.title}
              </h2>
              <p className="text-zinc-500 text-sm font-medium font-montserrat leading-6">
                {heading.subtitle}
              </p>
            </div>

            {/* Tab list */}
            <div className="flex flex-col gap-5">
              {industries.map((industry, i) => (
                <button
                  key={industry.id}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "shrink-0 text-left py-0.5 px-4 border-l-2 font-montserrat font-medium text-xl leading-8 transition-all duration-150 whitespace-normal",
                    i === activeIndex
                      ? "border-primary text-primary"
                      : "border-transparent text-stone-900 hover:text-primary hover:border-primary"
                  )}
                >
                  {industry.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: image card — 847×565 aspect ── */}
          <div className="w-full flex-1 relative rounded-[30px] overflow-hidden aspect-[847/565]">

            {/* Animated image swap */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                <ImageView
                  fill
                  src={active.image}
                  alt={active.name}
                  containerClassName="w-full h-full"
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-black/0 to-black pointer-events-none" />

            {/* Card content — bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-10 flex items-end justify-between gap-6 z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id + "-text"}
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <h3 className="text-zinc-100 font-montserrat font-medium text-2xl lg:text-3xl uppercase leading-10 mb-2">
                    {active.name}
                  </h3>
                  <p className="text-subtext text-sm lg:text-base font-medium font-montserrat leading-6 max-w-2xl">
                    {active.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <Link
                href={`/industries/${active.slug}`}
                className="shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-full bg-white text-orange-600 font-montserrat font-medium text-sm lg:text-base leading-7 whitespace-nowrap hover:bg-stone-50 transition-colors duration-150"
              >
                Explore
                <RotexArrow size={8} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
