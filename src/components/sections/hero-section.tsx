
"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { VideoPlayer } from "@/components/ui/video-player";
import { ImageView } from "@/components/ui/image-view";
import { RotexArrow } from "@/components/ui/rotex-arrow";

function ArrowBtn({
  dir,
  onClick,
}: {
  dir: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="size-10 rounded-full flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors duration-200"
      aria-label={dir === "prev" ? "Previous" : "Next"}
    >
      <RotexArrow
        size={9}
        color="#EF3E23"
        className={dir === "prev" ? "rotate-180" : undefined}
      />
    </button>
  );
}

type CtaButton = { label: string; href: string };
type Slide = {
  id: string;
  published?: boolean;
  title: string;
  description: string;
  media: { type: "image" | "video"; src: string; alt?: string; mobileSrc?: string };
  cta_buttons: CtaButton[];
};

type HeroSectionProps = {
  slides?: Slide[];
};

const defaultSlides: Slide[] = [
  {
    id: "default_1",
    title: "Flow Control. Where It Matters Most.",
    description:
      "Engineered precise solutions that reduce downtime, enhance safety, and ensure uninterrupted operations across critical industry applications.",
    media: { type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    cta_buttons: [
      { label: "EXPLORE SOLUTIONS", href: "/industries" },
      { label: "DOWNLOAD 'ZERO DOWNTIME BLUE PRINT'", href: "/downloads" },
    ],
  },
];

/* Figma: 577×496 exact */
const HEX_W = 577;
const HEX_H = 496;

/* Regular hexagon with 20px rounded corners, in objectBoundingBox (0–1).
   Vertices: TL(0.25,0) TR(0.75,0) R(1,0.5) BR(0.75,1) BL(0.25,1) L(0,0.5)
   Each Q bezier cuts 20px off the corner using computed tangent offsets. */
const HEX_PATH_BB =
  "M0.2847,0 L0.7153,0 Q0.75,0 0.7674,0.0349 L0.9826,0.4653 Q1.0,0.5 0.9826,0.5347 L0.7674,0.9651 Q0.75,1.0 0.7153,1.0 L0.2847,1.0 Q0.25,1.0 0.2326,0.9651 L0.0174,0.5347 Q0.0,0.5 0.0174,0.4653 L0.2326,0.0349 Q0.25,0 0.2847,0 Z";

/* Left-edge stroke — three Q beziers matching every rounded corner of HEX_PATH_BB:
   TL corner Q(144.25,0), L vertex Q(0,248), BL corner Q(144.25,496) */
const HEX_LEFT_EDGE =
  "M164.27,0 Q144.25,0 134.21,17.31 L10.04,230.79 Q0,248 10.04,265.21 L134.21,478.69 Q144.25,496 164.27,496";

export function HeroSection({ slides = defaultSlides }: HeroSectionProps) {
  const publishedSlides = slides.filter((s) => s.published !== false);
  const activeSlides = publishedSlides.length > 0 ? publishedSlides : defaultSlides;

  const [index, setIndex] = useState(0);
  const slide = activeSlides[index % activeSlides.length];

  const prev = () => setIndex(i => (i - 1 + activeSlides.length) % activeSlides.length);
  const next = () => setIndex(i => (i + 1) % activeSlides.length);

  // "Flow Control. Where It Matters Most." → lead sentence renders in the brand
  // gradient, the remainder drops to its own line on mobile (Figma).
  const [, titleLead = slide.title, titleRest = ""] =
    slide.title.match(/^([^.]*\.)\s*(.*)$/) ?? [];

  return (
    <section className="relative w-full flex justify-center overflow-hidden bg-stone-900">
      {/* 1440×740 canvas — centers on wide viewports, fills narrow ones */}
      <div className="relative w-full max-w-[1440px] lg:h-[740px]">

        {/* Hex slider — desktop only; Figma: left 784px (54.44%), top 160px */}
        <div
          className="absolute z-20 hidden lg:block"
          style={{ left: "54.44%", top: "160px" }}
        >
          <HexSlider index={index} media={slide.media} title={slide.title} />
        </div>

        {/* Content block — Figma: left 80px, top 404.5px, gap-9
            Mobile: relative flow with padding, offset below the fixed h-20 header (80px) + 40px gap;
            Desktop: absolute positioned, right edge pinned to the hex slider's right edge (94.51%)
            instead of a fixed width, so the CTA row below can stretch to meet it and push the
            arrow nav flush right — always on the same line as the buttons. */}
        <div className="relative lg:absolute z-30 flex flex-col gap-5 lg:gap-9 px-5 pt-26 pb-0 lg:px-0 lg:pt-0 lg:left-[80px] lg:right-[5.49%] lg:top-[404px]">

          {/* Fixed min-height so the button/nav row below stays put across slides —
              text length varies per slide, so without this the row shifted up/down
              on every Next/Prev click. */}
          <div className="relative min-h-[128px] lg:min-h-[210px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex flex-col gap-1 lg:gap-5"
              >
                {/* Figma — mobile: 24px / leading-8; desktop: 48px / leading-[58px] */}
                <h1
                  className="max-w-[597px] text-white font-normal leading-8 lg:leading-[58px]"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "clamp(24px, 3.33vw, 48px)",
                    letterSpacing: "-1.3px",
                  }}
                >
                  <span className="">{titleLead}</span>
                  {titleRest && <span className="block lg:inline lg:ml-2">{titleRest}</span>}
                </h1>

                {/* Figma — mobile: 12px / leading-5 / stone-300; desktop: 16px / leading-6 */}
                <p
                  className="max-w-[547px] text-stone-300 lg:text-subtext text-xs lg:text-base font-medium leading-5 lg:leading-6"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile: stacked, content-width buttons */}
          <div className="flex flex-col items-start gap-3 lg:hidden">
            {slide.cta_buttons.map((btn) => (
              <HeroOutlineBtn key={`${btn.label}-${btn.href}`} href={btn.href}>{btn.label}</HeroOutlineBtn>
            ))}
          </div>

          {/* Desktop: buttons + arrow nav on one line, nav pushed to the far right —
              Figma: gap-5, outline outline-1 outline-offset-[-1px] outline-stone-500 */}
          <div className="hidden lg:flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-5">
              {slide.cta_buttons.map((btn) => (
                <HeroOutlineBtn key={`${btn.label}-${btn.href}`} href={btn.href}>{btn.label}</HeroOutlineBtn>
              ))}
            </div>

            <nav aria-label="Banner navigation" className="inline-flex items-center gap-4">
              <ArrowBtn dir="prev" onClick={prev} />
              <ArrowBtn dir="next" onClick={next} />
            </nav>
          </div>

          {/* Mobile: hex video slider — bleeds past the right edge of the screen
              (Figma: 384px hex in a 384px frame, shifted right so ~9% overflows),
              clipped by the section's overflow-hidden. Nav arrows stay within the visible area. */}
          <div className="relative mt-2 -mr-10 lg:hidden">
            <div className="w-[112%]">
              <HexSlider index={index} media={slide.media} title={slide.title} fluid />
            </div>
            <nav aria-label="Banner navigation" className="absolute right-[15%] bottom-2 inline-flex items-center gap-3">
              <ArrowBtn dir="prev" onClick={prev} />
              <ArrowBtn dir="next" onClick={next} />
            </nav>
          </div>

        </div>
      </div>
    </section>
  );
}

/* Figma: rounded-[100px], outline-1, outline-offset-[-1px], outline-stone-500,
   px-5 py-2.5, text-xs (12px), font-semibold, uppercase, leading-5 */
function HeroOutlineBtn({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center whitespace-nowrap text-center rounded-[100px] outline outline-1 outline-offset-[-1px] outline-stone-500 px-5 py-2.5 text-white hover:bg-white/5 transition-colors duration-150"
      style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: "20px",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Link>
  );
}

/* Hexagon clip + video/image slider */
function HexSlider({
  index,
  media,
  title,
  fluid = false,
}: {
  index: number;
  media: Slide["media"];
  title: string;
  fluid?: boolean;
}) {
  /* Unique per instance — this component renders twice (desktop + mobile),
     and SVG id references break when the defining element sits in a
     display:none subtree, so duplicate ids must be avoided. */
  const uid = useId();
  const clipId = `hex-clip-bb-${uid}`;
  const gradId = `hex-stroke-grad-${uid}`;

  /* Fluid: scales to the parent's width via aspect-ratio instead of a fixed
     577×496 box — the clip-path (objectBoundingBox) and stroke SVG (viewBox)
     already scale, so no transform is needed and nothing overflows the viewport. */
  const sizeStyle = fluid
    ? { width: "100%", aspectRatio: `${HEX_W} / ${HEX_H}`, position: "relative" as const }
    : { width: HEX_W, height: HEX_H, position: "relative" as const, flexShrink: 0 };

  return (
    <div style={sizeStyle}>

      {/* Declares clip path in normalised 0–1 coords — scales with container */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={HEX_PATH_BB} />
          </clipPath>
        </defs>
      </svg>

      {/* Video clipped to hex shape */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `url(#${clipId})`,
          background: "#0D0D0D",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            {media.type === "video" ? (
              <VideoPlayer
                src={media.src}
                variant="dark"
                containerClassName="w-full h-full"
              />
            ) : (
              <>
                {media.mobileSrc && (
                  <ImageView
                    src={media.mobileSrc}
                    alt={media.alt ?? title}
                    fill
                    containerClassName="w-full h-full md:hidden"
                    unoptimized
                  />
                )}
                <ImageView
                  src={media.src}
                  alt={media.alt ?? title}
                  fill
                  containerClassName={media.mobileSrc ? "w-full h-full hidden md:block" : "w-full h-full"}
                  unoptimized
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gradient left-edge stroke */}
      <svg
        viewBox="0 0 577 496"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="496" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FF9A00" />
            <stop offset="45%"  stopColor="#F03900" />
            <stop offset="100%" stopColor="#950000" />
          </linearGradient>
        </defs>
        <path
          d={HEX_LEFT_EDGE}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

    </div>
  );
}
