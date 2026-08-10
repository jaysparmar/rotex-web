"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Award as AwardIcon } from "lucide-react";

type FeaturedAward = { id: string; title: string; year: string; image: string };

type AchievementsSectionProps = {
  heading?: string;
  achievements?: FeaturedAward[];
  cta?: { label: string; href: string };
};

export function AchievementsSection({
  heading = "What We Achieved So Far",
  achievements = [],
  cta = { label: "See More of Our Wins", href: "/about/awards" },
}: AchievementsSectionProps) {
  if (achievements.length === 0) return null;

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <h2 className="text-stone-900 font-montserrat font-normal text-2xl lg:text-4xl leading-8 lg:leading-10 mb-10 lg:mb-14 text-center">
          {heading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative h-48 w-full max-w-72 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {a.image ? (
                  <Image src={a.image} alt={a.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <AwardIcon className="size-12 text-stone-300" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-stone-500 font-montserrat font-medium text-sm leading-5">{a.year}</p>
                <p className="text-stone-900 font-montserrat font-semibold text-base leading-6 max-w-xs">{a.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-10 lg:mt-14">
          <Link
            href={cta.href}
            className="w-full lg:w-auto inline-flex justify-center items-center gap-3.5 px-6 py-3.5 rounded-[47px] lg:rounded-full bg-stone-900 text-white font-montserrat font-bold lg:font-semibold text-sm uppercase leading-5 shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] hover:bg-primary transition-colors duration-150"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
