"use client";
import dynamic from "next/dynamic";

const ChannelPartnerFlatMap = dynamic(() => import("./channel-partner-flat-map"), {
  ssr: false,
  loading: () => <div className="w-full aspect-[16/9] bg-stone-100 animate-pulse rounded-xl" />,
});

type Pin = { name: string; stateOrCity?: string | null; partnerCompany?: string | null; coordinates: [number, number] };

type ChannelPartnerMapSectionProps = {
  heading?: string;
  description?: string;
  callout?: string;
  pins: Pin[];
};

export function ChannelPartnerMapSection({
  heading = "Global Channel Partner Network",
  description = "Rotex has established a strong international distribution ecosystem across key industrial markets:",
  callout = "A globally trusted network ensuring local expertise with international engineering standards.",
  pins,
}: ChannelPartnerMapSectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <div className="text-center mb-6o">
          <h2 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
            {heading}
          </h2>
          <p className="mt-3 text-stone-500 font-montserrat font-medium text-sm lg:text-base leading-6 max-w-lg mx-auto">
            {description}
          </p>
        </div>

        <div className="relative">
          <div className="w-full aspect-[16/9]">
            <ChannelPartnerFlatMap pins={pins} />
          </div>
          <p className="absolute left-0 bottom-24 max-w-64 text-red-600 font-montserrat font-medium text-sm leading-6">
            {callout}
          </p>
        </div>
      </div>
    </section>
  );
}
