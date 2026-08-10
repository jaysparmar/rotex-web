import Link from "next/link";
import { Handshake } from "lucide-react";
import { HexFrame } from "@/components/ui/hex-frame";
import channelPartnerImg from "@/assets/Images/channel-partner/channle-partner.jpg";

type ChannelPartnerHeroSectionProps = {
  title?: string;
  description?: string;
  image?: string;
  cta?: { label: string; href: string };
};

export function ChannelPartnerHeroSection({
  title = "Partner with a Global Leader in Solenoid Valve & Fluid Control Solutions",
  description = "Join Rotex's international channel partner network and deliver high-performance, application-engineered solutions across Oil & Gas, Chemical, Power, Mining, and Industrial Automation sectors.",
  image,
  cta = { label: "Become a Channel Partner", href: "#form" },
}: ChannelPartnerHeroSectionProps) {
  const photo = image ?? channelPartnerImg.src;

  return (
    // Figma: 625px mobile / 600px desktop — a fixed frame, so the artwork is
    // clipped by it rather than stretching the section.
    <section className="relative bg-stone-900 min-h-156.25 lg:min-h-0 lg:h-170 pt-28 pb-16 lg:pb-20 overflow-hidden">
      {/*
        Desktop artwork. Figma places it at left 871 / top 178, 626×556 inside a
        1440×600 frame — i.e. it deliberately bleeds ~57px off the right edge and
        is clipped at the bottom. Expressed as percentages of the section so the
        same crop holds at any viewport width:
          left 871/1440 = 60.49%   width 626/1440 = 43.47%
      */}
      <div
        className="hidden lg:block absolute pointer-events-none"
        style={{ left: "60.49%", top: "178px", width: "43.47%" }}
      >
        <HexFrame
          src={photo}
          alt="Rotex channel partners shaking hands"
          placeholder={<Handshake className="relative size-16 text-stone-400/70" strokeWidth={1.5} />}
        />
      </div>

      <div className="container relative z-10 h-full flex flex-col justify-between">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="text-subtext text-sm font-semibold font-montserrat leading-5 hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-subtext text-sm font-semibold font-montserrat leading-5">/</span>
          <span className="text-red-600 text-sm font-semibold font-montserrat leading-5">Become a Channel Partner</span>
        </nav>

        {/* Copy — bottom-aligned, 685px column on desktop */}
        <div className="flex flex-col gap-5 mt-10 lg:mt-0 lg:w-171.25">
          {/* Figma — mobile: 24px / font-normal; desktop: 30px / font-medium */}
          <h1 className="text-gradient-hero text-2xl lg:text-3xl font-normal lg:font-medium font-montserrat leading-8 lg:leading-10">
            {title}
          </h1>
          <p className="text-white text-sm lg:text-base font-normal font-montserrat leading-5 lg:leading-6 lg:w-143">
            {description}
          </p>
          {/* mobile: 192×40 white pill with a red hairline; desktop: stone-100, auto width */}
          <Link
            href={cta.href}
            className="inline-flex w-48 lg:w-fit h-10 lg:h-auto items-center justify-center gap-1.5 px-6 lg:py-3.5 rounded-[47px] bg-white lg:bg-stone-100 outline outline-[0.5px] -outline-offset-[0.5px] outline-red-600 lg:outline-0 text-red-600 text-sm font-bold font-montserrat uppercase leading-5 shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] hover:bg-primary hover:text-white hover:outline-primary transition-colors duration-200"
          >
            {cta.label}
          </Link>

          {/* Mobile artwork — Figma: 335×288 below the copy */}
          <div className="lg:hidden mt-5">
            <HexFrame
              src={photo}
              alt="Rotex channel partners shaking hands"
              className="w-80 max-w-full"
              placeholder={<Handshake className="relative size-16 text-stone-400/70" strokeWidth={1.5} />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
