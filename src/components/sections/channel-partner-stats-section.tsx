"use client";
import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";

type Stat = { value: string; label: string };

const STATS: Stat[] = [
  { value: "47%", label: "Growth in industrial valve revenue" },
  { value: "53+", label: "Partners with a relationship lasting over 10 years." },
  { value: "71,000+", label: "Catalogue items" },
  { value: "6,100+", label: "Customized solenoid valve solutions" },
  { value: "50+", label: "International certifications & approvals" },
  { value: "3", label: "Global offices across UAE, Netherlands, and Malaysia" },
];

function RotexMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="rotex-mark-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF9A00" />
          <stop offset="55%" stopColor="#F03900" />
          <stop offset="100%" stopColor="#950000" />
        </linearGradient>
      </defs>
      <path d="M20 1.5L37.79 11.75V32.25L20 42.5L2.21 32.25V11.75L20 1.5Z" fill="url(#rotex-mark-grad)" />
      <path d="M20 12.5L28.66 17.5V27.5L20 32.5L11.34 27.5V17.5L20 12.5Z" fill="white" />
    </svg>
  );
}

function StatValue({ value }: { value: string }) {
  const match = value.match(/^([\d,]+)(%|\+)?$/);
  if (!match) return <>{value}</>;
  const [, number, suffix] = match;

  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const numeric = parseInt(number.replace(/,/g, ""), 10) || 0;

  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 60, damping: 20, restDelta: 0.5 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString("en-US"));

  useEffect(() => {
    if (isInView) count.set(numeric);
  }, [isInView, count, numeric]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix && <span className="text-primary">{suffix}</span>}
    </span>
  );
}

export function ChannelPartnerStatsSection() {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-9">
          <div className="flex items-start">
            <RotexMark />
          </div>
          {STATS.slice(0, 3).map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <p className="text-stone-900 text-3xl lg:text-4xl font-semibold font-montserrat leading-tight">
                <StatValue value={stat.value} />
              </p>
              <p className="text-stone-500 text-sm font-medium font-montserrat leading-5 max-w-50">
                {stat.label}
              </p>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <h2 className="text-stone-900 text-xl lg:text-2xl font-semibold font-montserrat leading-7">
              Built for Growth
            </h2>
            <p className="text-stone-500 text-sm font-medium font-montserrat leading-5 max-w-56">
              Expand your reach, operate efficiently, and grow with confidence.
            </p>
          </div>
          {STATS.slice(3, 6).map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <p className="text-stone-900 text-3xl lg:text-4xl font-semibold font-montserrat leading-tight">
                <StatValue value={stat.value} />
              </p>
              <p className="text-stone-500 text-sm font-medium font-montserrat leading-5 max-w-50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
