"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import { BenefitIcon } from "@/components/sections/channel-partner-benefit-icons";
import "swiper/css";

function IconWrap({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

type Benefit = { icon: string; text: string };

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <div className="h-60 sm:h-full p-7 bg-neutral-100 rounded-xl outline outline-1 -outline-offset-1 outline-neutral-200 shadow-[0px_2px_0px_0px_rgba(240,57,0,1.00)] flex flex-col gap-10 overflow-hidden">
      <IconWrap>
        <BenefitIcon iconKey={benefit.icon} />
      </IconWrap>
      <p className="text-stone-900 font-montserrat font-medium text-base leading-6">{benefit.text}</p>
    </div>
  );
}

const DEFAULT_BENEFITS: Benefit[] = [
  { icon: "proven-solutions", text: "Access to a wide range of proven industrial solutions" },
  { icon: "expand-industries", text: "Opportunity to expand into multiple high-demand industries" },
  { icon: "scalable-model", text: "Strong margin potential with a scalable business model" },
  { icon: "reduced-risk", text: "Reduced financial risk through partner-first practices" },
  { icon: "support", text: "Consistent support for sales, technical, and operations" },
  { icon: "growth-chart", text: "Long-term partnership focused on mutual growth" },
];

type ChannelPartnerBenefitsSectionProps = {
  heading?: string;
  benefits?: Benefit[];
};

export function ChannelPartnerBenefitsSection({
  heading = "What You Get as a Rotex Channel Partner",
  benefits = DEFAULT_BENEFITS,
}: ChannelPartnerBenefitsSectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container max-w-275 flex flex-col items-center gap-10 lg:gap-14">
        <h2 className="text-center text-stone-900 font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
          {heading}
        </h2>

        {/* Mobile: swiper (a peek of the next card shows to signal it scrolls) */}
        <div className="self-stretch sm:hidden -mx-5 px-5">
          <Swiper modules={[A11y]} spaceBetween={20} slidesPerView="auto" className="!pb-1 !overflow-visible">
            {benefits.map((b, i) => (
              <SwiperSlide key={`${b.text}-${i}`} style={{ width: "85%" }}>
                <BenefitCard benefit={b} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Tablet/desktop: static grid */}
        <div className="hidden self-stretch sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <BenefitCard key={`${b.text}-${i}`} benefit={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
