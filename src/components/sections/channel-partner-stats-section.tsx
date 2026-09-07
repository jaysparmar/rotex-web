"use client";
import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";

type Stat = { value: string; label: string };

const DEFAULT_STATS: Stat[] = [
  { value: "47%", label: "Growth in industrial valve revenue" },
  { value: "53+", label: "Partners with a relationship lasting over 10 years." },
  { value: "71,000+", label: "Catalogue items" },
  { value: "6,100+", label: "Customized solenoid valve solutions" },
  { value: "50+", label: "International certifications & approvals" },
  { value: "3", label: "Global offices across UAE, Netherlands, and Malaysia" },
];

/* Rotex ring-and-hex mark — supplied artwork, radial orange → black gradient */
function RotexMark() {
  return (
    <svg width="79" height="75" viewBox="0 0 79 75" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M2.97097 52.4521C4.98573 56.9769 7.75407 60.945 11.2795 64.3321C14.8282 67.6944 18.9817 70.3233 23.7663 72.1945C28.5494 74.0646 33.7856 75 39.5008 75C45.2159 75 50.376 74.0646 55.1848 72.1945C59.9926 70.3233 64.1965 67.6944 67.7724 64.3321C71.3472 60.945 74.1166 56.9769 76.0794 52.4014C78.0428 47.8508 79 42.8714 79 37.4866C79 32.1018 78.0423 27.1234 76.0794 22.5727C74.1161 18.0231 71.3714 14.0549 67.8228 10.6669C64.2727 7.27978 60.0934 4.6509 55.2352 2.80552C50.3755 0.93433 45.114 0 39.3994 0C33.6848 0 28.5489 0.93433 23.7658 2.80552C18.9817 4.6509 14.8282 7.25396 11.279 10.6162C7.75357 13.9537 4.98523 17.9218 2.97047 22.5221C0.981924 27.1234 0 32.1028 0 37.4866C0 42.8704 0.981924 47.9272 2.97097 52.4521ZM16.2884 35.5906L26.2836 18.2255C26.8628 17.2396 27.8941 16.6322 29.0025 16.6322L48.9913 16.6322C50.1492 16.6322 51.1558 17.2396 51.7093 18.2255L61.7044 35.5906C62.2589 36.5765 62.2589 37.7903 61.7044 38.7504L51.7093 56.1428C51.1563 57.103 50.1492 57.7093 48.9913 57.7093L29.0025 57.7093C27.8936 57.7093 26.8623 57.1035 26.2836 56.1428L16.2884 38.7504C15.734 37.7903 15.734 36.5771 16.2884 35.5906Z"
        fill="url(#rotex-mark-grad)"
      />
      <defs>
        <radialGradient
          id="rotex-mark-grad"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-2.53476 -324.813 152.061 -1.18937 -21.3015 41.1766)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF9A00" />
          <stop offset="0.28" stopColor="#F03900" />
          <stop offset="0.61" stopColor="#950000" />
          <stop offset="0.87" />
        </radialGradient>
      </defs>
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

type ChannelPartnerStatsSectionProps = {
  stats?: Stat[];
  growthHeading?: string;
  growthDescription?: string;
};

export function ChannelPartnerStatsSection({
  stats = DEFAULT_STATS,
  growthHeading = "Built for Growth",
  growthDescription = "Expand your reach, operate efficiently, and grow with confidence.",
}: ChannelPartnerStatsSectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-9">
          <div className="flex items-start">
            <RotexMark />
          </div>
          {stats.slice(0, 3).map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <p className="text-stone-900 text-3xl lg:text-4xl font-medium font-montserrat leading-tight">
                <StatValue value={stat.value} />
              </p>
              <p className="text-stone-500 text-sm font-medium font-montserrat leading-5 max-w-50">
                {stat.label}
              </p>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <h2 className="text-stone-900 text-xl lg:text-2xl font-semibold font-montserrat leading-7">
              {growthHeading}
            </h2>
            <p className="text-stone-500 text-sm font-medium font-montserrat leading-5 max-w-56">
              {growthDescription}
            </p>
          </div>
          {stats.slice(3, 6).map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <p className="text-stone-900 text-3xl lg:text-4xl font-medium font-montserrat leading-tight">
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
