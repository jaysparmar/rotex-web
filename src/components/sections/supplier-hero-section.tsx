import Link from "next/link";
import { Package } from "lucide-react";
import { HexFrame } from "@/components/ui/hex-frame";

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
  cta = { label: "Apply as a Supplier", href: "/join/supplier#form" },
}: SupplierHeroSectionProps) {
  return (
    <section className="relative bg-stone-900 pt-28 pb-16 lg:pb-20 overflow-hidden">
      <div className="container relative">
        {/* Breadcrumb */}
        <nav className="relative z-10 flex items-center gap-2 mb-10 lg:mb-16" aria-label="Breadcrumb">
          <Link href="/" className="text-zinc-100 text-sm font-medium font-montserrat hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-zinc-500 text-sm font-medium font-montserrat">/</span>
          <span className="text-red-600 text-sm font-medium font-montserrat">Become a Supplier</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="flex flex-col gap-5">
            <h1 className="text-gradient-hero text-4xl lg:text-6xl font-normal font-montserrat leading-tight lg:leading-[57px]">
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
            alt="Rotex industrial supplier components"
            className="w-full lg:ml-auto"
            placeholder={<Package className="relative size-16 text-stone-400/70" strokeWidth={1.5} />}
          />
        </div>
      </div>
    </section>
  );
}
