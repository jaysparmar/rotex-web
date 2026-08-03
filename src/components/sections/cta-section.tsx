import Image from "next/image";
import { PillButton } from "@/components/ui/pill-button";
import ctaBg from "@/assets/cta_bg.jpg";

export function CtaSection() {
  return (
    <section className="pt-7 pb-14 lg:py-20">
      <div className="container">

        <div className="relative rounded-2xl overflow-hidden">
          {/* Background image */}
          <Image
            src={ctaBg}
            alt="CTA background"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          {/* Figma mobile: p-5 card, gap-3 between title and body, gap-8 before the button */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-5 lg:py-16 lg:px-8">
            <h2 className="text-white font-montserrat font-medium text-2xl lg:text-3xl leading-8 lg:leading-10 mb-3 max-w-60 lg:max-w-[956px]">
              Let&apos;s Solve Your Next Challenge
            </h2>
            <p className="text-subtext font-montserrat font-medium text-sm lg:text-base leading-5 lg:leading-6 mb-8 lg:mb-5 max-w-96">
              Connect with our experts to find the right solution for your application.
            </p>
            <PillButton
              href="/contact"
              tone="light"
              size="md"
              className="w-full lg:w-auto h-12 lg:h-auto"
            >
              Book My Free Consultation
            </PillButton>
          </div>
        </div>

      </div>
    </section>
  );
}
