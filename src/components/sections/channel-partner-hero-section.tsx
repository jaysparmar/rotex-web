import Link from "next/link";
import { Handshake } from "lucide-react";
import { HexFrame } from "@/components/ui/hex-frame";

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
  cta = { label: "Become a Channel Partner", href: "/join/channel-partner#form" },
}: ChannelPartnerHeroSectionProps) {
  return (
    <section className="relative bg-stone-900 pt-28 pb-16 lg:pb-20 overflow-hidden">
      <div className="container relative">
        {/* Breadcrumb */}
        <nav className="relative z-10 flex items-center gap-2 mb-10 lg:mb-16" aria-label="Breadcrumb">
          <Link href="/" className="text-subtext text-sm font-medium font-montserrat hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-zinc-500 text-sm font-medium font-montserrat">/</span>
          <span className="text-red-600 text-sm font-medium font-montserrat">Become a Channel Partner</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="flex flex-col gap-5">
            <h1 className="text-gradient-hero text-2xl lg:text-3xl font-medium font-montserrat leading-8 lg:leading-10">
              {title}
            </h1>
            <p className="text-white text-sm lg:text-base font-normal font-montserrat leading-6 max-w-md">
              {description}
            </p>
            <Link
              href={cta.href}
              className="inline-flex w-fit items-center justify-center gap-1.5 px-6 py-3.5 rounded-full bg-stone-100 text-red-600 text-sm font-bold font-montserrat uppercase leading-5 shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] hover:bg-white transition-colors duration-150"
            >
              {cta.label}
            </Link>
          </div>

          {/* Right: photo — hexagon frame with gradient stroke */}
          <HexFrame
            src={image}
            alt="Rotex channel partners shaking hands"
            className="w-full lg:ml-auto"
            placeholder={<Handshake className="relative size-16 text-stone-400/70" strokeWidth={1.5} />}
          />
        </div>
      </div>
    </section>
  );
}
