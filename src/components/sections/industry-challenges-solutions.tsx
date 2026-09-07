"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HexIcon } from "@/components/ui/hex-icon";

type Card = { title: string; description: string };

type Props = {
  challengesTitle: string;
  challenges: Card[];
  solutionsTitle: string;
  solutions: Card[];
};

const VISIBLE_LIMIT = 5;

function CardRow({ card, color }: { card: Card; color?: string }) {
  return (
    <div className="self-stretch py-2.5 lg:py-3 border-b border-neutral-200 last:border-b-0 flex flex-col justify-center items-start gap-1.25">
      <div className="self-stretch inline-flex justify-start items-start gap-1.25">
        {/* 24px box holding a 12px glyph, so the bullet tops out with the first line of copy */}
        <span className="size-6 shrink-0 flex items-start justify-center pt-1.75">
          <HexIcon size={12} color={color} />
        </span>
        <p className="flex-1 text-stone-900 text-sm font-medium font-montserrat leading-5">
          <span className="font-semibold">{card.title}</span>
          {card.description && ` - ${card.description}`}
        </p>
      </div>
    </div>
  );
}

export function IndustryChallengesSolutions({
  challengesTitle,
  challenges,
  solutionsTitle,
  solutions,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!challenges?.length && !solutions?.length) return null;

  const canExpand = challenges.length > VISIBLE_LIMIT || solutions.length > VISIBLE_LIMIT;
  const visibleChallenges = challenges.slice(0, VISIBLE_LIMIT);
  const restChallenges = challenges.slice(VISIBLE_LIMIT);
  const visibleSolutions = solutions.slice(0, VISIBLE_LIMIT);
  const restSolutions = solutions.slice(VISIBLE_LIMIT);

  return (
    <section className="bg-white py-10 lg:py-16">
      <div className="container flex flex-col gap-5 lg:flex-row lg:justify-start lg:items-stretch lg:gap-16">

        {/* Challenges */}
        {/* zinc-100 (#f4f4f5), not neutral-100 — the theme overrides neutral-100 to a near-white #f9fafb */}
        <div className="flex-1 self-stretch p-5 lg:p-7 bg-zinc-100 rounded-xl flex flex-col gap-5 lg:gap-6">
          <h3 className="text-stone-900 text-xl lg:text-2xl font-medium font-montserrat leading-7 lg:leading-8 line-clamp-5">
            {challengesTitle}
          </h3>
          <div className="flex flex-col">
            {visibleChallenges.map((c, i) => (
              <CardRow key={i} card={c} color="#d4d4d4" />
            ))}
            <AnimatePresence initial={false}>
              {expanded && restChallenges.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  {restChallenges.map((c, i) => (
                    <CardRow key={i} card={c} color="#d4d4d4" />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Solutions */}
        {/* Figma: bg-red-50 / text-red-600 */}
        <div className="flex-1 p-5 lg:p-7 bg-[#FFF7F4] rounded-xl flex flex-col gap-5 lg:gap-6">
          <h3 className="text-[#EF3E23] text-xl lg:text-2xl font-medium font-montserrat leading-7 lg:leading-8 line-clamp-5">
            {solutionsTitle}
          </h3>
          <div className="flex flex-col">
            {visibleSolutions.map((s, i) => (
              <CardRow key={i} card={s} color="#dc2626" />
            ))}
            <AnimatePresence initial={false}>
              {expanded && restSolutions.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  {restSolutions.map((s, i) => (
                    <CardRow key={i} card={s} color="#EF3E23" />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {canExpand && (
        <div className="container flex justify-center mt-6 lg:mt-8">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-primary text-sm font-semibold font-montserrat underline underline-offset-2 hover:text-primary/80 transition-colors duration-150"
          >
            {expanded ? "View Less" : "View More"}
          </button>
        </div>
      )}
    </section>
  );
}
