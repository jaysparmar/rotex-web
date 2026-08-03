"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";

const BENEFITS = [
  "Long-term partnerships built on trust and consistency",
  "Strong focus on supplier growth in capability and capacity",
  "Continuous support to improve process, efficiency, and quality",
  "Dedicated supplier development team for ongoing improvement",
  "Fair and transparent working relationships",
  "Opportunity to scale with a growing industrial network",
];

type Stat = { value: string; label: string };

const STATS: Stat[] = [
  { value: "90%", label: "Components Supported" },
  { value: "98%", label: "ISO Certified Suppliers" },
  { value: "10-30%", label: "Business Growth" },
  { value: "95%", label: "IATF Certified (Automotive)" },
];

function StatValue({ value }: { value: string }) {
  const match = value.match(/^(\d+)(%)$/);

  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const numeric = match ? parseInt(match[1], 10) : 0;

  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 60, damping: 20, restDelta: 0.5 });
  const rounded = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => {
    if (isInView && match) count.set(numeric);
  }, [isInView, count, numeric, match]);

  if (!match) {
    return <span>{value}</span>;
  }

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      <span>%</span>
    </span>
  );
}

type SupplierBenefitsSectionProps = {
  heading?: string;
  description?: string;
  stats?: Stat[];
  cta?: { label: string; href: string };
};

export function SupplierBenefitsSection({
  heading = "Become a Supplier",
  description = "Join our supply chain and grow with a partner focused on quality, long-term relationships, and continuous capability development.",
  stats = STATS,
  // same-document fragment — a full route href makes Next re-run the router
  cta = { label: "Apply as a Supplier", href: "#form" },
}: SupplierBenefitsSectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        {/* Left: heading + stats */}
        <div className="lg:flex-1 flex flex-col gap-14">
          <div className="flex flex-col gap-3">
            <h2 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
              {heading}
            </h2>
            <p className="max-w-md text-stone-500 font-montserrat font-medium text-base leading-6">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <p className="text-stone-900 font-montserrat font-medium text-3xl leading-10">
                  <StatValue value={stat.value} />
                </p>
                <p className="text-stone-500 font-montserrat font-medium text-sm leading-5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: gradient benefits card */}
        {/* Figma "Gradient/Orange to Black Radial" — the shared token uses the
            brand hexes (#ff9a00 → #f03900 → #950000 → #000000); the Tailwind
            amber-500/orange-600 pair it replaced are off-brand approximations. */}
        <div className="lg:w-118.25 lg:shrink-0 p-10 bg-gradient-orange-black-radial rounded-xl flex flex-col justify-between gap-10">
          <ul className="flex flex-col gap-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-1.5 size-3 shrink-0 bg-neutral-200" />
                <span className="text-white font-montserrat font-medium text-base leading-6">{b}</span>
              </li>
            ))}
          </ul>

          <Link
            href={cta.href}
            className="inline-flex w-fit items-center justify-center gap-3.5 px-6 py-3.5 rounded-full bg-white text-stone-900 font-montserrat font-semibold text-sm uppercase leading-5 hover:bg-primary hover:text-white transition-colors duration-200"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
