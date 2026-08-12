"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type IndustryStat = { value: string; suffix?: string; label: string };

function AnimatedCounter({ value, suffix }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  // Trailing letters in the value (e.g. "10M") are a unit, not noise — keep them
  // and render after the animated digits instead of stripping them out.
  const unit = value.match(/[a-zA-Z]+$/)?.[0] ?? "";
  const numeric = parseInt(value.replace(/\D/g, ""), 10) || 0;

  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 60, damping: 20, restDelta: 0.5 });
  const rounded = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => {
    if (isInView) count.set(numeric);
  }, [isInView, count, numeric]);

  return (
    <span ref={ref} className="text-stone-900 text-3xl font-normal font-montserrat leading-10">
      <motion.span>{rounded}</motion.span>
      {unit}
      {suffix && <span className="text-primary">{suffix}</span>}
    </span>
  );
}

type IndustryOverviewProps = {
  sectionTitle: string;
  overview: string;
  stats: IndustryStat[];
};

export function IndustryOverview({ sectionTitle, overview, stats }: IndustryOverviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section>
      <div className="container py-10 lg:py-14 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">

        {/* Title + body + read more */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-neutral-500 text-xl lg:text-3xl font-normal font-montserrat leading-8 lg:leading-11">
            {sectionTitle}
          </h2>

          <div className="flex flex-col gap-1.5">
            {/* line-clamp, not a fixed height — 5.25rem is 3.5 lines at the
                mobile 24px leading, so the copy was cut through a line. Clamping
                by line count stays exact at every leading. */}
            <p
              className={cn(
                "text-neutral-300 text-sm lg:text-[15px] font-normal font-montserrat leading-6 lg:leading-7",
                !expanded && "line-clamp-3"
              )}
            >
              {overview}
            </p>

            <motion.button
              onClick={() => setExpanded((e) => !e)}
              className="text-left text-stone-400 text-sm lg:text-base font-normal font-montserrat leading-5 lg:leading-6 underline underline-offset-2 hover:text-stone-600 transition-colors duration-150"
              whileTap={{ scale: 0.97 }}
            >
              <motion.span
                key={expanded ? "less" : "more"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {expanded ? "Read less" : "Read more"}
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* Stats: 2 per row, wraps to new row as more stats are added */}
        <div className="shrink-0 grid grid-cols-2 gap-x-7 gap-y-6 lg:gap-x-12 lg:gap-y-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col gap-1.5 lg:gap-4 items-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="text-stone-500 text-base font-normal font-montserrat uppercase leading-6 text-left">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
