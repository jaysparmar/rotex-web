"use client";
import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { HexIcon } from "@/components/ui/hex-icon";
import industryFaqBg from "@/assets/Images/industry/industry-faq-bg.jpg";

type WhyChooseCard = { title: string; description: string };

type Props = {
  industryName: string;
  whyChoose: {
    title: string;
    highlight: string;
    cards: WhyChooseCard[];
  };
};

// ── Shared card — title and description are always visible, no toggle ─────────

function WhyChooseCardItem({
  card,
  titleClass = "text-xl leading-7",
}: {
  card: WhyChooseCard;
  titleClass?: string;
}) {
  return (
    <div className="relative w-full bg-white rounded-lg p-5 overflow-hidden">
      <div className="flex flex-col gap-5 pr-8">
        <h3 className={`text-stone-900 font-medium font-montserrat ${titleClass}`}>
          {card.title}
        </h3>
        <p className="text-stone-500 text-sm font-medium font-montserrat leading-5">
          {card.description}
        </p>
      </div>
      <div className="absolute top-3 right-3">
        <HexIcon size={14} />
      </div>
    </div>
  );
}

// ── Desktop: sticky scroll version ───────────────────────────────────────────

function WhyChooseDesktop({ whyChoose }: Omit<Props, "industryName">) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const scrollDist = useMotionValue(300);
  const wrapperH = useTransform(scrollDist, (d) => `calc(100vh + ${d}px)`);

  // Recalculate scroll distance whenever cards expand / collapse
  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      scrollDist.set(Math.max(0, el.scrollHeight - 552));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollDist]);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(
    [scrollYProgress, scrollDist],
    ([p, d]: number[]) => -(p * d)
  );

  return (
    <motion.div ref={wrapperRef} style={{ height: wrapperH }} className="relative">
      <div className="sticky top-24 h-[792px] overflow-hidden">
        <Image src={industryFaqBg} alt="" fill priority className="object-cover object-center" />
        <div className="container relative z-10 h-full flex items-start pt-[120px] gap-16">
          <div className="w-96 shrink-0">
            <h2 className="text-white text-4xl font-medium font-montserrat leading-12">
              {whyChoose.title}{" "}
              <span className="text-gradient-hero">{whyChoose.highlight}</span>
            </h2>
          </div>

          <div className="flex-1 flex flex-col relative">
            <div className="h-[552px] overflow-hidden">
              <motion.div ref={cardsRef} style={{ y }} className="flex flex-col gap-3">
                {whyChoose.cards.map((card, i) => (
                  <WhyChooseCardItem key={i} card={card} />
                ))}
              </motion.div>
            </div>
            <div className="h-0.5 bg-white/60 w-[110%] -ml-10" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Mobile: simple stacked version ───────────────────────────────────────────

function WhyChooseMobile({ whyChoose }: Omit<Props, "industryName">) {
  return (
    <div className="relative overflow-hidden">
      <Image src={industryFaqBg} alt="" fill priority className="object-cover object-center" />
      <div className="relative z-10 container py-12 flex flex-col gap-8">
        <h2 className="text-white text-2xl font-medium font-montserrat leading-8">
          {whyChoose.title}{" "}
          <span className="text-orange-300">{whyChoose.highlight}</span>
        </h2>
        <div className="flex flex-col gap-4">
          {whyChoose.cards.map((card, i) => (
            <WhyChooseCardItem key={i} card={card} titleClass="text-base leading-6" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Exported ──────────────────────────────────────────────────────────────────

export function WhyChooseSection({ whyChoose }: Props) {
  return (
    <>
      <div className="lg:hidden">
        <WhyChooseMobile whyChoose={whyChoose} />
      </div>
      <div className="hidden lg:block">
        <WhyChooseDesktop whyChoose={whyChoose} />
      </div>
    </>
  );
}
