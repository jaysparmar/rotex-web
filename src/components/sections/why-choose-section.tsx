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
      {/* bg matches the artwork's right-edge pixel (#11070c) so the fill
          continues it seamlessly where the image ends on wide viewports */}
      <div className="sticky top-24 h-[792px] overflow-hidden bg-[#11070c]">
        {/* Figma places the artwork at 2427×1618, offset left -43 / top -487
            inside the 1440×792 frame. Expressed as percentages of the frame so
            the same crop holds at any viewport width:
              width 2427/1440 = 168.54%   left -43/1440 = -2.99%
              top  -487/792   = -61.49%   (height auto keeps the 1.5 aspect) */}
        {/* sizes="170vw" because the artwork renders at 168.54% of the frame —
            without it Next serves a viewport-width variant and the browser
            upscales it, which reads as blur. */}
        <Image
          src={industryFaqBg}
          alt=""
          priority
          quality={90}
          sizes="170vw"
          className="absolute max-w-none pointer-events-none select-none"
          style={{ width: "168.54%", height: "auto", left: "-2.99%", top: "-61.49%" }}
        />
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
          {/* same gradient as desktop — was a flat amber, so the highlight
              changed colour between breakpoints */}
          <span className="text-gradient-hero">{whyChoose.highlight}</span>
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
