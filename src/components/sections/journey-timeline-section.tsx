"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { cn } from "@/lib/utils";

type Milestone = { year: string; title: string; description: string };

type JourneyTimelineSectionProps = {
  heading?: string;
  milestones?: Milestone[];
};

const defaultMilestones: Milestone[] = [
  {
    year: "1967",
    title: "Foundation of Rotex",
    description:
      "Rotex was established by Mr. Jitendra Shah for the manufacturing of textile machinery under the name Rotex – Rotating Textile Machinery.",
  },
  {
    year: "1974",
    title: "International Technical Collaboration",
    description:
      "Rotex entered into a technical collaboration with the Swiss company Eugen Seitz for the manufacturing of solenoid valves.",
  },
  {
    year: "1976",
    title: "Entry into Solenoid Valve Manufacturing",
    description:
      "Started manufacturing high-quality solenoid valves, marking the beginning of Rotex's journey in fluid automation.",
  },
  {
    year: "1983",
    title: "Manufacturing Shift to Vadodara",
    description: "The manufacturing operations for solenoid valves were shifted to Vadodara, Gujarat.",
  },
  {
    year: "1988",
    title: "Expansion with a New Manufacturing Unit",
    description:
      "To meet growing demand, Rotex established an additional manufacturing facility at Vitthal Udyognagar, Anand.",
  },
  {
    year: "1991",
    title: "Mumbai Plant Restarted",
    description: "The Mumbai plant resumed operations with manufacturing focused on pneumatic actuators and cylinders.",
  },
  {
    year: "2000",
    title: "ISO 9001 Certification Achieved",
    description: "Rotex became ISO 9001 certified, reinforcing its commitment to quality management systems.",
  },
  {
    year: "2001",
    title: "ATEX Certification for Exd Solenoid Valves",
    description: "Received ATEX certification for flameproof (Exd) solenoid valves.",
  },
  {
    year: "2006",
    title: "ATEX Certification for Exia Solenoid Valves",
    description:
      "Expanded hazardous area product offerings with ATEX certification for intrinsically safe (Exia) solenoid valves.",
  },
  {
    year: "2007",
    title: "PED Certification",
    description: "Rotex's solenoid valve program received Pressure Equipment Directive (PED) certification.",
  },
  {
    year: "2009",
    title: "Global Industry Approvals",
    description: "Obtained prestigious certifications and approvals including GOST and INMETRO.",
  },
  {
    year: "2012",
    title: "SIL3 Certification",
    description: "Achieved SIL3 certification, strengthening Rotex's position in safety-critical automation applications.",
  },
  {
    year: "2014",
    title: "Strategic Acquisition",
    description:
      "Acquired the German company Maxsev Valves GmbH, expanding Rotex's global footprint and technological capabilities.",
  },
  {
    year: "2017",
    title: "International Safety & Quality Standards",
    description: "Obtained ISO 14001, ISO 45001, and KOSHA certifications.",
  },
  {
    year: "2018",
    title: "Business Restructuring",
    description: "Divested the pneumatic actuator, cylinder, ball valve, and butterfly valve business divisions.",
  },
  {
    year: "2022",
    title: "UL Certification for Exd Solenoid Valves",
    description: "Received UL certification for Exd solenoid valves, enhancing global market acceptance.",
  },
  {
    year: "2023",
    title: "JAPANEx Certification",
    description: "Achieved JAPANEx certification, strengthening Rotex's presence in international hazardous-area markets.",
  },
  {
    year: "2025",
    title: "Major Expansion & Certification Milestone",
    description:
      "Expanded operations with a 1.3 million sq. ft. land development and achieved the BS EN 161 Kitemark Certification.",
  },
];

export function JourneyTimelineSection({
  heading = "Built Beyond Standards",
  milestones = defaultMilestones,
}: JourneyTimelineSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  // Mirrors activeIndex so the autoplay timer can read it without re-subscribing.
  const activeRef = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const trackRect = track.getBoundingClientRect();
        const center = trackRect.left + trackRect.width / 2;
        let closest = 0;
        let closestDist = Infinity;
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          const dist = Math.abs(r.left + r.width / 2 - center);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        activeRef.current = closest;
        setActiveIndex(closest);
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      track.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, [milestones.length]);

  const scrollToIndex = (i: number, behavior: ScrollBehavior = "smooth") => {
    const el = cardRefs.current[i];
    const track = trackRef.current;
    if (!el || !track) return;
    const trackRect = track.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const elCenter = elRect.left - trackRect.left + track.scrollLeft + elRect.width / 2;
    const target = elCenter - track.clientWidth / 2;
    track.scrollTo({ left: target, behavior });
  };

  // Center the first milestone on mount so it starts as the active card, matching the design.
  useEffect(() => {
    scrollToIndex(0, "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autoplay — advances one milestone at a time and wraps, paused while the
  // visitor is hovering or touching the track.
  useEffect(() => {
    if (paused || milestones.length < 2) return;
    const id = setInterval(() => {
      scrollToIndex((activeRef.current + 1) % milestones.length);
    }, 3500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, milestones.length]);

  const scroll = (dir: "left" | "right") => {
    const next = dir === "right"
      ? Math.min(activeIndex + 1, milestones.length - 1)
      : Math.max(activeIndex - 1, 0);
    scrollToIndex(next);
  };

  return (
    // zinc-100 (#f4f4f5), not neutral-100 — the theme overrides neutral-100 to a near-white #f9fafb
    <section className="bg-zinc-100 py-14 lg:py-20 overflow-hidden">
      <div className="container mb-10 lg:mb-14 flex items-center justify-between gap-4">
        <h2 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-3xl leading-8 lg:leading-10">
          {heading}
        </h2>
        {/* Arrows are mobile-only — desktop relies on autoplay + drag scroll */}
        <div className="flex lg:hidden items-center gap-3.5 shrink-0">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous"
            className="size-10 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150"
          >
            <RotexArrow size={7} className="rotate-180 text-[#EF3E23]" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            className="size-10 rounded-full bg-orange-600/10 outline-1 -outline-offset-1 outline-stone-200 flex items-center justify-center hover:outline-orange-600 transition-colors duration-150"
          >
            <RotexArrow size={7} className="text-[#EF3E23]" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div
        ref={trackRef}
        className="no-scrollbar overflow-x-auto scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", paddingInline: "max(1.25rem, calc(50% - 160px))" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className="relative inline-flex gap-10">
          {/* Timeline rule — runs through the dot row; each dot is z-10 with a
              background-coloured ring so it reads as sitting on the line. */}
          <div className="absolute inset-x-0 top-27.75 h-px bg-neutral-200" aria-hidden="true" />

          {milestones.map((m, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.div
                key={m.year}
                ref={(el) => { cardRefs.current[i] = el; }}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="w-64 lg:w-80 shrink-0 snap-center flex flex-col items-center text-center gap-5"
              >
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <p
                    className={cn(
                      "font-montserrat font-semibold text-base leading-6 transition-colors duration-200",
                      isActive ? "text-stone-900" : "text-neutral-400"
                    )}
                  >
                    {m.year}
                  </p>
                  <h3
                    className={cn(
                      "h-14 font-montserrat font-semibold text-xl leading-7 transition-colors duration-200",
                      isActive ? "text-[#EF3E23]" : "text-neutral-400"
                    )}
                  >
                    {m.title}
                  </h3>
                </div>
                <div
                  className={cn(
                    "relative z-10 size-2.5 rounded-full ring-4 ring-zinc-100 transition-colors duration-200",
                    isActive ? "bg-[#EF3E23]" : "bg-neutral-200"
                  )}
                />
                <p
                  className={cn(
                    "font-montserrat font-medium text-sm leading-5 transition-colors duration-200",
                    isActive ? "text-stone-900" : "text-neutral-400"
                  )}
                >
                  {m.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
