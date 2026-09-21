import Link from "next/link";
import Image from "next/image";
import careerHero from "@/assets/Images/channel-partner/career-hero.svg";

type CareerHeroSectionProps = {
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
  hasOpenPositions?: boolean;
};

export function CareerHeroSection({
  title = "Build Your Future With Us",
  description = "Take the next step in your career and work on meaningful projects that drive real impact across industries.",
  cta = { label: "See Open Roles", href: "#positions" },
  hasOpenPositions = true,
}: CareerHeroSectionProps) {
  return (
    <section className="relative bg-stone-900 min-h-[640px] lg:min-h-0 pt-28 pb-16 lg:pb-20 overflow-hidden">
      <div className="container relative h-full flex flex-col">
        <Image
          src={careerHero}
          alt=""
          className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-90 h-auto max-w-[50%] pointer-events-none"
        />

        {/* Breadcrumb */}
        <nav className="relative z-10 flex items-center gap-2 mb-10 lg:mb-16" aria-label="Breadcrumb">
          <Link href="/" className="text-subtext text-sm font-semibold font-montserrat leading-5 hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-subtext text-sm font-semibold font-montserrat leading-5">/</span>
          <span className="text-[#EF3E23] text-sm font-semibold font-montserrat leading-5">Career</span>
        </nav>

        <div className="relative flex flex-col items-start gap-5 max-w-143">
          <h1 className="text-gradient-hero text-4xl lg:text-6xl font-normal font-montserrat leading-tight lg:leading-[57px]">
            {title}
          </h1>
          <p className="text-white text-sm lg:text-base font-normal font-montserrat leading-6">
            {description}
          </p>
        </div>

        {/* Illustration — desktop version is absolute (above); mobile gets its
            own centered, in-flow copy since it was previously hidden outright. */}
        <Image
          src={careerHero}
          alt=""
          className="lg:hidden mx-auto mt-auto mb-8 w-64 h-auto pointer-events-none"
        />

        {hasOpenPositions && (
          <Link
            href="#positions"
            className="relative mb-6 lg:mb-0 w-full lg:w-fit inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-full bg-stone-100 text-[#EF3E23] text-sm font-bold font-montserrat uppercase leading-5 shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] hover:bg-primary hover:text-white transition-colors duration-200"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
