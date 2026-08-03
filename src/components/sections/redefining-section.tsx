"use client";
import { useEffect, useRef, useState } from "react";
import { VideoPlayer } from "@/components/ui/video-player";
import { ImageView } from "@/components/ui/image-view";

type Stat = {
  id?: string;
  value: number;
  suffix: string;
  label: string;
  format_comma?: boolean;
  published?: boolean;
};

type RedefiningSectionProps = {
  heading?: { title: string; subtitle: string };
  media?: { type: "image" | "video"; src: string; alt?: string };
  tagline?: { prefix: string; highlight: string; suffix: string };
  stats?: Stat[];
};

const defaultHeading = {
  title: "Redefining Flow Performance",
  subtitle:
    "A new chapter shaped by precision engineering, advanced capabilities, and a commitment to solving the most demanding industrial challenges.",
};

const defaultMedia: { type: "image" | "video"; src: string } = {
  type: "video",
  src: "https://www.w3schools.com/html/mov_bbb.mp4",
};

const defaultTagline = { prefix: "Leading Flow", highlight: "Intelligence", suffix: "Since 1967" };

const defaultStats: Stat[] = [
  { value: 33, suffix: "", label: "Utility Patents" },
  { value: 83, suffix: "+", label: "Countries Served Worldwide" },
  { value: 21, suffix: "+", label: "International Certifications" },
  { value: 80, suffix: "+", label: "Global Distributors" },
  { value: 9000, suffix: "+", label: "Customers", format_comma: true },
  { value: 6000, suffix: "+", label: "Customised Solutions Developed", format_comma: true },
];

function Counter({ raw, suffix, comma, suffixClassName }: { raw: number; suffix: string; comma?: boolean; suffixClassName?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setCount(Math.round(eased * raw));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [raw]);

  const display = comma ? count.toLocaleString() : String(count);

  return (
    <span ref={ref}>
      {display}
      {suffix && <span className={suffixClassName}>{suffix}</span>}
    </span>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function RedefiningSection({
  heading = defaultHeading,
  media = defaultMedia,
  tagline = defaultTagline,
  stats = defaultStats,
}: RedefiningSectionProps) {
  const visibleStats = stats.filter((s) => s.published !== false);

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container px-5 sm:px-10 lg:px-20">

        {/* Heading + Subtext */}
        <div className="flex flex-col items-center gap-5 mb-14">
          <h2 className="text-3xl lg:text-4xl font-normal font-montserrat leading-10 text-center">
            <span className="text-gradient-orange-dark">{heading.title}</span>
          </h2>
          <p className="text-center text-stone-500 text-sm lg:text-base font-medium font-montserrat leading-6 max-w-2xl">
            {heading.subtitle}
          </p>
        </div>

        {/* Media — 1080×608 */}
        <div className="rounded-2xl lg:rounded-[30px] overflow-hidden mb-14 lg:mb-16 w-full"
             style={{ aspectRatio: "1080 / 608" }}>
          {media.type === "video" ? (
            <VideoPlayer src={media.src} controls />
          ) : (
            <ImageView src={media.src} alt={media.alt ?? heading.title} fill className="object-cover" unoptimized />
          )}
        </div>

        {/* Bottom: tagline + stats — mobile */}
        {/* Figma mobile: everything left-aligned, tagline font-medium, numbers leading-8 */}
        <div className="flex lg:hidden flex-col items-start gap-10">
          <h3 className="font-montserrat font-medium text-stone-900 text-2xl leading-8">
            {tagline.prefix} <br />
            <span className="text-gradient-orange-dark">{tagline.highlight}</span> {tagline.suffix}
          </h3>

          <div className="grid grid-cols-2 gap-x-4 gap-y-9 w-full max-w-80">
            {visibleStats.map(({ id, value, suffix, label, format_comma }, i) => (
              <div key={id ?? `${label}-${i}`} className="flex flex-col items-start gap-1.5">
                <p className="text-stone-900 font-montserrat font-medium text-2xl leading-8">
                  <Counter raw={value} suffix={suffix} comma={format_comma} suffixClassName="text-primary" />
                </p>
                <p className="text-stone-500 font-montserrat font-medium text-sm leading-5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: tagline + stats — desktop */}
        <div className="hidden lg:flex lg:items-center gap-10 lg:gap-24">

          {/* Left tagline */}
          <h3 className="font-montserrat font-normal text-stone-900 text-3xl lg:text-4xl leading-10 lg:shrink-0">
            {tagline.prefix} <br />
            <span className="text-gradient-orange-dark">{tagline.highlight}</span> {tagline.suffix}
          </h3>

          {/* Stats grid */}
          <div className="flex-1 flex flex-col gap-6">
            {chunk(visibleStats, 3).map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-6">
                {row.map(({ id, value, suffix, label, format_comma }, i) => (
                  <div key={id ?? `${label}-${i}`} className="flex flex-col gap-1.5">
                    <p className="text-stone-900 font-montserrat font-medium text-2xl lg:text-3xl leading-10">
                      <Counter raw={value} suffix={suffix} comma={format_comma} suffixClassName="text-primary" />
                    </p>
                    <p className="text-stone-900 font-montserrat font-medium text-xs lg:text-sm leading-5">{label}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
