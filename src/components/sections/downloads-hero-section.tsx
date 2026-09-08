import Link from "next/link";

export function DownloadsHeroSection() {
  return (
    <section className="relative bg-stone-900 pt-28 pb-16 lg:pt-32 lg:pb-20">
      <div className="container flex flex-col gap-10">
        <nav className="flex items-center gap-3" aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-subtext text-sm font-semibold font-montserrat leading-5 hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="text-subtext text-sm font-semibold font-montserrat leading-5">
            /
          </span>
          <span className="text-[#EF3E23] text-sm font-semibold font-montserrat leading-5">
            Downloads
          </span>
        </nav>

        <div className="flex flex-col gap-3">
          <h1 className="text-gradient-hero text-5xl font-normal font-montserrat leading-15">Downloads</h1>
          <p className="text-white text-base font-normal font-montserrat leading-6">
            Access all resources, certifications, and documents.
          </p>
        </div>
      </div>
    </section>
  );
}
