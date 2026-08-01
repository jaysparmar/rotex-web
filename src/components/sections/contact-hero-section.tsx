import Link from "next/link";

export function ContactHeroSection() {
  return (
    <section className="bg-stone-900 pt-28 pb-16 lg:pt-32 lg:pb-20">
      <div className="container flex flex-col gap-10">
        <nav className="flex items-center gap-3" aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-neutral-200 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="text-neutral-200 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">/</span>
          <span className="text-red-600 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">Contact</span>
        </nav>

        <div className="flex flex-col gap-5 max-w-xl">
          <h1 className="text-gradient-hero text-4xl lg:text-6xl font-normal font-montserrat lg:leading-14.25">
            Let&apos;s Connect
          </h1>
          <p className="text-white text-base font-normal font-montserrat leading-6">
            From product selection to technical guidance, we help you make the right decisions for your application.
          </p>
          <Link
            href="#contact-form"
            className="inline-flex w-fit items-center justify-center gap-1.5 px-6 py-3.5 rounded-full bg-stone-100 text-red-600 text-sm font-bold font-montserrat uppercase leading-5 shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] hover:bg-white transition-colors duration-150"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
