import { useId } from "react";
import { ImageView } from "@/components/ui/image-view";

/* Same hexagon geometry as the homepage hero's slider (HexSlider in
   hero-section.tsx): a 577×496 regular hexagon with 20px-rounded corners,
   gradient stroke down the left edge. Reused here as a static image frame. */
const HEX_W = 577;
const HEX_H = 496;

const HEX_PATH_BB =
  "M0.2847,0 L0.7153,0 Q0.75,0 0.7674,0.0349 L0.9826,0.4653 Q1.0,0.5 0.9826,0.5347 L0.7674,0.9651 Q0.75,1.0 0.7153,1.0 L0.2847,1.0 Q0.25,1.0 0.2326,0.9651 L0.0174,0.5347 Q0.0,0.5 0.0174,0.4653 L0.2326,0.0349 Q0.25,0 0.2847,0 Z";

const HEX_LEFT_EDGE =
  "M164.27,0 Q144.25,0 134.21,17.31 L10.04,230.79 Q0,248 10.04,265.21 L134.21,478.69 Q144.25,496 164.27,496";

type HexFrameProps = {
  src?: string;
  alt: string;
  placeholder?: React.ReactNode;
  className?: string;
};

export function HexFrame({ src, alt, placeholder, className }: HexFrameProps) {
  const uid = useId();
  const clipId = `hex-frame-clip-${uid}`;
  const gradId = `hex-frame-stroke-${uid}`;

  return (
    <div
      className={className}
      style={{ width: "100%", aspectRatio: `${HEX_W} / ${HEX_H}`, position: "relative" }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={HEX_PATH_BB} />
          </clipPath>
        </defs>
      </svg>

      <div
        style={{ position: "absolute", inset: 0, clipPath: `url(#${clipId})`, background: "#0D0D0D" }}
      >
        {src ? (
          <ImageView src={src} alt={alt} fill containerClassName="w-full h-full" className="object-cover" />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-linear-to-br from-orange-900/40 via-stone-800 to-stone-900">
            <div className="absolute inset-0 bg-radial-[at_80%_10%] from-orange-600/25 via-transparent to-transparent" />
            {placeholder}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${HEX_W} ${HEX_H}`}
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2={HEX_H} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF9A00" />
            <stop offset="45%" stopColor="#F03900" />
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
