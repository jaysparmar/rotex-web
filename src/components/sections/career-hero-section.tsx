import Link from "next/link";

type CareerHeroSectionProps = {
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
};

export function CareerHeroSection({
  title = "Build Your Future With Us",
  description = "Take the next step in your career and work on meaningful projects that drive real impact across industries.",
  cta = { label: "See Open Roles", href: "/join/career#roles" },
}: CareerHeroSectionProps) {
  return (
    <section className="relative bg-stone-900 pt-28 pb-16 lg:pb-20 overflow-hidden">
      <div className="container relative">
        {/* Breadcrumb */}
        <nav className="relative z-10 flex items-center gap-2 mb-10 lg:mb-16" aria-label="Breadcrumb">
          <Link href="/" className="text-zinc-100 text-sm font-medium font-montserrat hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-zinc-500 text-sm font-medium font-montserrat">/</span>
          <span className="text-red-600 text-sm font-medium font-montserrat">Career</span>
        </nav>

        <div className="flex flex-col items-start gap-5 max-w-143">
          <h1 className="text-gradient-hero text-4xl lg:text-6xl font-normal font-montserrat leading-tight lg:leading-[57px]">
            {title}
          </h1>
          <p className="text-white text-sm lg:text-base font-normal font-montserrat leading-6">
            {description}
          </p>
          <Link
            href={cta.href}
            className="inline-flex w-fit items-center justify-center gap-1.5 px-6 py-3.5 rounded-full bg-stone-100 text-red-600 text-sm font-bold font-montserrat uppercase leading-5 shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] hover:bg-white transition-colors duration-150"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
