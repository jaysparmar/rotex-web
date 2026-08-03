import Link from "next/link";

type AwardsHeroSectionProps = {
  title?: string;
  description?: string;
};

const crumbClass =
  "text-subtext text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide";

export function AwardsHeroSection({
  title = "Awards & Recognition",
  description = "Celebrating excellence and innovation in industrial automation. Our commitment to quality and technological advancement has earned recognition from leading organizations worldwide.",
}: AwardsHeroSectionProps) {
  return (
    <section className="bg-stone-900 pt-26 pb-14 lg:pt-36 lg:pb-24">
      {/* container, not px-20 — so the title lines up with the navbar logo */}
      <div className="container flex flex-col gap-8 lg:gap-12">
        <nav className="flex items-center gap-3" aria-label="Breadcrumb">
          <Link href="/" className={`${crumbClass} hover:text-white transition-colors`}>
            Home
          </Link>
          <span className={crumbClass}>/</span>
          <Link href="/about" className={`${crumbClass} hover:text-white transition-colors`}>
            About Us
          </Link>
          <span className={crumbClass}>/</span>
          <span className="text-red-600 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
            Awards &amp; Recognition
          </span>
        </nav>

        <div className="flex flex-col gap-4 lg:gap-6">
          <h1 className="text-gradient-hero text-3xl lg:text-5xl font-normal font-montserrat leading-10 lg:leading-15">
            {title}
          </h1>
          <p className="max-w-163.5 text-white text-sm lg:text-base font-normal font-montserrat leading-5 lg:leading-6">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
