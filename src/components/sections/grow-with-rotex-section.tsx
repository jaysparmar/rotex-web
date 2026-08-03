import Link from "next/link";
import type { StaticImageData } from "next/image";
import { ImageView } from "@/components/ui/image-view";
import growthImage from "@/assets/Images/aboutus/growth.jpg";

type GrowWithRotexSectionProps = {
  title?: string;
  description?: string;
  image?: string | StaticImageData;
  cta?: { label: string; href: string };
};

export function GrowWithRotexSection({
  title = "Grow With Rotex",
  description = "Join our global distribution network and deliver precision-engineered flow control solutions trusted across critical industries.",
  image = growthImage,
  cta = { label: "Become a Partner", href: "/join/channel-partner" },
}: GrowWithRotexSectionProps) {
  return (
    <section className="relative bg-stone-900 py-14 lg:py-20 overflow-hidden">
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 779"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-33.3463 702.297C9.14216 796.958 67.5226 879.971 141.869 950.828C216.705 1021.17 304.297 1076.16 405.198 1115.31C506.067 1154.43 616.492 1174 737.016 1174C857.54 1174 966.36 1154.43 1067.77 1115.31C1169.16 1076.16 1257.82 1021.17 1333.23 950.828C1408.61 879.971 1467.02 796.958 1508.41 701.238C1549.81 606.038 1570 501.869 1570 389.219C1570 276.569 1549.8 172.422 1508.41 77.2216C1467.01 -17.9576 1409.12 -100.971 1334.29 -171.849C1259.42 -242.707 1171.29 -297.703 1068.83 -336.308C966.349 -375.454 855.393 -395 734.879 -395C614.366 -395 506.056 -375.454 405.187 -336.308C304.297 -297.703 216.705 -243.247 141.859 -172.908C67.5119 -103.088 9.13153 -20.0753 -33.3569 76.1627C-75.2926 172.422 -96 276.591 -96 389.219C-96 501.848 -75.2926 607.637 -33.3463 702.297ZM247.501 349.555L458.284 -13.7223C470.498 -34.3484 492.248 -47.0546 515.623 -47.0546L937.159 -47.0546C961.576 -47.0546 982.805 -34.3484 994.476 -13.7223L1205.26 349.555C1216.95 370.181 1216.95 395.572 1205.26 415.659L994.476 779.508C982.815 799.594 961.576 812.279 937.159 812.279L515.623 812.279C492.237 812.279 470.488 799.605 458.284 779.508L247.501 415.659C235.807 395.572 235.807 370.192 247.501 349.555Z"
          fill="#333333"
        />
      </svg>

      <div className="container relative">
        <div className="flex flex-col overflow-hidden rounded-2xl lg:flex-row lg:h-119.75 lg:max-w-266 lg:mx-auto">
          {/* Text panel */}
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden bg-white p-6 lg:w-145.5 lg:shrink-0 lg:p-12">
            <svg
              aria-hidden
              className="pointer-events-none absolute -left-41.5 top-36 h-83.75 w-100.25"
              width="401"
              height="335"
              viewBox="0 0 401 335"
              fill="none"
            >
              <path
                opacity="0.05"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-38.3602 19.3555L-160.902 230.304C-167.699 242.288 -167.699 257.026 -160.902 268.69L-38.3602 479.97C-31.2657 491.64 -18.6216 499 -5.02585 499L240.038 499C254.233 499 266.581 491.634 273.36 479.97L395.902 268.69C402.699 257.026 402.699 242.282 395.902 230.304L273.36 19.3555C266.575 7.37824 254.233 0 240.038 0L-5.02585 0C-18.6154 0 -31.2595 7.37824 -38.3602 19.3555Z"
                fill="#EE3E23"
              />
            </svg>
            <div className="relative flex flex-col gap-2.5 lg:gap-4">
              <h2 className="text-stone-900 font-montserrat font-semibold lg:font-medium text-xl lg:text-4xl leading-7 lg:leading-10">
                {title}
              </h2>
              <p className="text-stone-500 font-montserrat font-medium text-sm lg:text-base leading-5 lg:leading-6 max-w-96">
                {description}
              </p>
            </div>
            {/* Figma mobile: full-width h-12 pill */}
            <Link
              href={cta.href}
              className="relative inline-flex w-full lg:w-fit h-12 lg:h-auto items-center justify-center gap-3.5 rounded-[100px] bg-orange-600 px-6 lg:py-3.5 text-white font-montserrat font-semibold text-sm uppercase leading-5 hover:bg-orange-700 transition-colors duration-200"
            >
              {cta.label}
            </Link>
          </div>

          {/* Image panel */}
          <ImageView
            src={image}
            alt="Rotex team meeting a channel partner"
            fill
            containerClassName="h-56 lg:h-auto lg:flex-1"
            className="object-cover"
            unoptimized={typeof image === "string"}
          />
        </div>
      </div>
    </section>
  );
}
