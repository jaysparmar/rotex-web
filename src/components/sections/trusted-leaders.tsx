import type { StaticImageData } from "next/image";
import { ImageView } from "@/components/ui/image-view";
import partner1 from "@/assets/Images/trustPartners/img_1.png";
import partner2 from "@/assets/Images/trustPartners/img_2.png";
import partner3 from "@/assets/Images/trustPartners/img_3.png";
import partner4 from "@/assets/Images/trustPartners/img_4.png";
import partner5 from "@/assets/Images/trustPartners/img_5.png";
import partner6 from "@/assets/Images/trustPartners/img_6.png";
import partner7 from "@/assets/Images/trustPartners/img_7.png";
import partner8 from "@/assets/Images/trustPartners/img_8.png";

type LogoItem = { id: string | number; src: string | StaticImageData; alt: string };

type TrustedLeadersProps = {
  title?: string;
  primary?: boolean;
  logos?: LogoItem[];
};

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

export function TrustedLeaders({
  title = "Trusted by Industry Leaders",
  primary = false,
  logos = defaultLogos,
}: TrustedLeadersProps) {
  return (
    <section className={primary ? "bg-white border-t py-10 lg:py-0 lg:h-64" : "bg-white border-t border-stone-100 py-8 lg:py-0 lg:h-36"}>
      <div className="container h-full flex flex-col items-center gap-5 lg:flex-row lg:gap-8">

        {/* Label */}
        {primary ? (
          <p className="text-stone-900 self-stretch lg:self-auto text-center lg:text-left text-base lg:text-2xl font-montserrat font-normal leading-6 lg:leading-8 lg:max-w-56 text-balance shrink-0">
            {title}
          </p>
        ) : (
          <p className="text-stone-500 self-stretch lg:self-auto text-center lg:text-left text-base lg:text-xl font-montserrat font-medium leading-6 lg:leading-7 lg:whitespace-nowrap shrink-0">
            {title}
          </p>
        )}

        {/* Divider — desktop only */}
        <div className="hidden lg:block w-px h-5 bg-stone-200 shrink-0" />

        {/* Marquee */}
        {primary ? (
          <div className="relative self-stretch lg:self-auto lg:flex-1 lg:min-w-0 overflow-hidden h-14 lg:h-24">
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #ffffff 20%, transparent 100%)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #ffffff 20%, transparent 100%)" }} />
            <div className="animate-marquee flex items-center gap-14 w-max h-14 lg:h-24">
              {[...logos, ...logos].map(({ id, src, alt }, i) => (
                <div key={`${id}-${i}`} className="shrink-0 h-14 lg:h-24 flex items-center">
                  <ImageView
                    src={src}
                    alt={alt}
                    width={96}
                    height={64}
                    className="h-full w-auto object-contain"
                    unoptimized={typeof src === "string"}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative self-stretch lg:self-auto lg:flex-1 lg:min-w-0 overflow-hidden h-14 lg:h-16">
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #ffffff 20%, transparent 100%)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #ffffff 20%, transparent 100%)" }} />
            <div className="animate-marquee flex items-center gap-12 w-max h-14 lg:h-16">
              {[...logos, ...logos].map(({ id, src, alt }, i) => (
                <div key={`${id}-${i}`} className="shrink-0 h-14 lg:h-16 flex items-center">
                  <ImageView
                    src={src}
                    alt={alt}
                    width={80}
                    height={28}
                    className="h-full w-auto object-contain"
                    unoptimized={typeof src === "string"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
