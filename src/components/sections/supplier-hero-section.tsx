import Link from "next/link";
import { Package } from "lucide-react";
import { HexFrame } from "@/components/ui/hex-frame";
// web-sized copy (1600px, 169KB). The original is 4096×3073 / 8.5MB — Next has
// to decode and resample that for every distinct render width, which is why the
// mobile variant sat on the loading placeholder long after desktop had cached.
import supplierImg from "@/assets/Images/channel-partner/become-supplier-web.jpg";

type SupplierHeroSectionProps = {
  title?: string;
  description?: string;
  image?: string;
  cta?: { label: string; href: string };
};

export function SupplierHeroSection({
  title = "Become a Supplier",
  description = "Expand your reach by supplying high-demand industrial components to a global distribution network.",
  image,
  cta = { label: "Apply as a Supplier", href: "#form" },
}: SupplierHeroSectionProps) {
  const photo = image ?? supplierImg.src;

  return (
    // Same pattern as the Channel Partner hero: 625px mobile / 600px desktop,
    // a fixed frame so the artwork is clipped by it rather than stretching it.
    // flex column so the inner container can flex-1 and fill the frame — with a
    // min-h parent, a percentage h-full resolves to auto and mt-auto has no
    // free space to push the CTA into.
    <section className="relative bg-stone-900 min-h-156.25 lg:min-h-0 lg:h-170 pt-28 pb-16 lg:pb-20 overflow-hidden flex flex-col">
      {/*
        Desktop artwork. Figma places it at left 871 / top 178, 626×556 inside a
        1440×600 frame — it deliberately bleeds ~57px off the right edge and is
        clipped at the bottom. Percentages of the section keep that crop at any
        viewport width:
          left 871/1440 = 60.49%   width 626/1440 = 43.47%
      */}
      <div
        className="hidden lg:block absolute pointer-events-none"
        style={{ left: "60.49%", top: "178px", width: "43.47%" }}
      >
        <HexFrame
          src={photo}
          alt="Rotex industrial supplier components"
          placeholder={<Package className="relative size-16 text-stone-400/70" strokeWidth={1.5} />}
        />
      </div>

      {/*
        Mobile artwork. Figma: 384×384 at left 29 / top 292 in a 384×625 frame —
        it bleeds ~29px off the right and is clipped at the bottom.
          left 29.23/384 = 7.61%   top 292/625 = 46.72%
        Width is 116.4% rather than 100% because HexFrame is 577:496, not square:
        to reach the designed 384px height it needs 384 × 577/496 ≈ 447px of
        width (447/384 = 116.4%). At 100% it rendered ~62px too short and the
        bottom crop never happened.
      */}
      <div
        className="lg:hidden absolute pointer-events-none"
        style={{ left: "7.61%", top: "46.72%", width: "116.4%" }}
      >
        <HexFrame
          src={photo}
          alt="Rotex industrial supplier components"
          placeholder={<Package className="relative size-16 text-stone-400/70" strokeWidth={1.5} />}
        />
      </div>

      <div className="container relative z-10 flex-1 flex flex-col">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="text-subtext text-sm font-semibold font-montserrat leading-5 hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-subtext text-sm font-semibold font-montserrat leading-5">/</span>
          <span className="text-red-600 text-sm font-semibold font-montserrat leading-5">Become a Supplier</span>
        </nav>

        {/* Copy — top on mobile (mt-5), pushed to the bottom on desktop (lg:mt-auto) */}
        <div className="flex flex-col gap-5 mt-5 lg:mt-auto lg:w-171.25">
          {/* mobile: 30px / font-normal; desktop: 30px / font-medium */}
          <h1 className="text-gradient-hero text-3xl font-normal lg:font-medium font-montserrat leading-10">
            {title}
          </h1>
          <p className="text-white text-sm lg:text-base font-normal font-montserrat leading-5 lg:leading-6 lg:w-143">
            {description}
          </p>
        </div>

        {/* CTA — mt-auto pins it to the bottom on mobile; on desktop it just
            follows the copy. Mobile is a full-width white pill with a red
            hairline, desktop a stone-100 auto-width pill. */}
        <Link
          href={cta.href}
          className="inline-flex w-full lg:w-fit h-10 lg:h-auto mt-auto lg:mt-5 items-center justify-center gap-1.5 px-6 lg:py-3.5 rounded-[47px] bg-white lg:bg-stone-100 outline-[0.5px] outline-offset-[-0.5px] outline-red-600 lg:outline-0 text-red-600 text-sm font-bold font-montserrat uppercase leading-5 shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] hover:bg-primary hover:text-white hover:outline-primary transition-colors duration-200"
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
