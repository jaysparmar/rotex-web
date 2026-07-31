"use client";
import { Fragment } from "react";
import type { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { ImageView } from "@/components/ui/image-view";
import { VideoPlayer } from "@/components/ui/video-player";
import partner1 from "@/assets/Images/trustPartners/img_1.png";
import partner2 from "@/assets/Images/trustPartners/img_2.png";
import partner3 from "@/assets/Images/trustPartners/img_3.png";
import partner4 from "@/assets/Images/trustPartners/img_4.png";
import partner5 from "@/assets/Images/trustPartners/img_5.png";
import partner6 from "@/assets/Images/trustPartners/img_6.png";
import partner7 from "@/assets/Images/trustPartners/img_7.png";
import partner8 from "@/assets/Images/trustPartners/img_8.png";

type Stat = { value: string; label: string };
type LogoItem = { id: string | number; src: string | StaticImageData; alt: string };

type AboutStorySectionProps = {
  heading?: string;
  paragraphs?: string[];
  stats?: Stat[];
  trustedLabel?: string;
  logos?: LogoItem[];
  videoSrc?: string;
};

const defaultParagraphs = [
  "In 1967, in the industrial city of Vadodara, India, a company was founded with a single obsession: build flow control components so precisely engineered that the process plants which depend on them never have to think about them again.",
  "That obsession did not change as Rotex grew. It deepened. Each decade brought new industries, new continents, and new applications: gas fields in Saudi Arabia, pharmaceutical cleanrooms in Europe, rocket test facilities in India, and commercial trucks crossing the Alps. The applications changed. The engineering standard never wavered.",
];

const defaultStats: Stat[] = [
  { value: "10M+", label: "Field units operating" },
  { value: "58", label: "Years of engineering" },
  { value: "13", label: "Global certifications" },
  { value: "29+", label: "Patents protected" },
  { value: "81", label: "Countries served" },
  { value: "5", label: "Leading Oil & Gas operators served" },
];

const defaultLogos: LogoItem[] = [
  { id: 0, src: partner1, alt: "Partner" },
  { id: 1, src: partner2, alt: "Partner" },
  { id: 2, src: partner3, alt: "Partner" },
  { id: 3, src: partner4, alt: "Partner" },
  { id: 4, src: partner5, alt: "Partner" },
  { id: 5, src: partner6, alt: "Partner" },
  { id: 6, src: partner7, alt: "Partner" },
  { id: 7, src: partner8, alt: "Partner" },
];

export function AboutStorySection({
  heading = "Our Story",
  paragraphs = defaultParagraphs,
  stats = defaultStats,
  trustedLabel = "Trusted by Industry leaders",
  logos = defaultLogos,
  videoSrc = "https://www.w3schools.com/html/mov_bbb.mp4",
}: AboutStorySectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col">

        <div className="flex flex-col gap-10 lg:flex-row justify-betweenalso  lg:gap-20">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 lg:max-w-117 flex flex-col gap-5"
          >
            <h2 className="text-stone-900 font-montserrat font-semibold text-sm uppercase leading-5">
              {heading}
            </h2>
            <p className="text-stone-900 font-montserrat font-medium text-sm lg:text-base leading-6">
              {paragraphs.map((p, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {p}
                </Fragment>
              ))}
            </p>
          </motion.div>

          {/* Stats grid */}
          <div className="lg:w-96 lg:shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-x-6 gap-y-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col gap-1.5"
              >
                <p className="text-red-600 font-montserrat font-medium text-3xl leading-10">
                  {stat.value}
                </p>
                <p className="text-stone-900 font-montserrat font-medium text-sm leading-5">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trusted by Industry leaders — logo marquee */}
        <div className="mt-10 lg:mt-16 pb-20 flex flex-col items-center gap-5 lg:flex-row lg:gap-16">
          <p className="lg:w-36 shrink-0 text-red-600 text-center lg:text-left font-montserrat font-semibold text-base leading-6">
            {trustedLabel}
          </p>
          <div className="relative w-full overflow-hidden h-14 lg:h-16">
            <div
              className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #ffffff 20%, transparent 100%)" }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #ffffff 20%, transparent 100%)" }}
            />
            <div className="animate-marquee flex items-center gap-12 w-max h-14 lg:h-16">
              {[...logos, ...logos].map(({ id, src, alt }, i) => (
                <div key={`${id}-${i}`} className="shrink-0 h-14 lg:h-16 flex items-center">
                  <ImageView
                    src={src}
                    alt={alt}
                    width={80}
                    height={28}
                    className="object-contain"
                    unoptimized={typeof src === "string"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Story video — explicit heights per breakpoint so it never dominates the
            viewport on shorter laptop screens; object-cover crops instead of distorting */}
        <div className="w-full shrink-0 h-56 sm:h-72 md:h-96 lg:h-105 xl:h-120 2xl:h-150 rounded-2xl overflow-hidden bg-stone-900">
          <VideoPlayer src={videoSrc} controls />
        </div>

      </div>
    </section>
  );
}
