import { notFound } from "next/navigation";
import type { StaticImageData } from "next/image";
import { PageHero } from "@/components/ui/page-hero";
import { IndustryOverview } from "@/components/ui/industry-overview";
import { IndustryTabs } from "@/components/sections/industry-tabs";
import { WhyChooseSection } from "@/components/sections/why-choose-section";
import { IndustryEnquiryForm } from "@/components/sections/industry-enquiry-form";
import { IndustryHeroCtas } from "@/components/ui/industry-hero-ctas";
import { getIndustryWithSubIndustries } from "@/lib/industries";

import oilBg        from "@/assets/Images/breadcurmbBackgrounds/oil_bg.jpg";
import powerBg      from "@/assets/Images/breadcurmbBackgrounds/power_bg.png";
import automativeBg from "@/assets/Images/breadcurmbBackgrounds/automative_bg.png";
import railBg       from "@/assets/Images/breadcurmbBackgrounds/rail_bg.jpg";
import aerospaceBg  from "@/assets/Images/breadcurmbBackgrounds/aerospace_bg.jpg";
import machineBg    from "@/assets/Images/breadcurmbBackgrounds/machine_bg.jpg";
import defaultBg    from "@/assets/Images/breadcurmbBackgrounds/default_bg.jpg";

const BG_MAP: Record<string, StaticImageData> = {
  oil:        oilBg,
  power:      powerBg,
  automative: automativeBg,
  rail:       railBg,
  aerospace:  aerospaceBg,
  machine:    machineBg,
  process:    defaultBg,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ sector: string }>;
};

export const dynamic = "force-dynamic";

export default async function IndustrySectorLayout({ children, params }: Props) {
  const { sector } = await params;
  const industry = await getIndustryWithSubIndustries(sector);
  if (!industry) notFound();

  const bg = industry.bgKey ? BG_MAP[industry.bgKey] : undefined;

  return (
    <div>
      {/* Fixed — never re-renders on tab switch */}
      <PageHero title={industry.name} description={industry.description} bg={bg}>
        <IndustryHeroCtas />
      </PageHero>

      <IndustryOverview
        sectionTitle={industry.sectionTitle}
        overview={industry.overview}
        stats={industry.stats as unknown as { value: string; suffix?: string; label: string }[]}
      />

      {/* This wrapper is the sticky tab bar's containing block: the bar stays
          pinned while sub-sector content scrolls under it, then scrolls away
          with this div once the Why Choose section below is reached. */}
      <div>
        <IndustryTabs
          sectorSlug={sector}
          subIndustries={industry.subIndustries}
        />

        {/* Changes on sub-sector navigation — scroll target for tab clicks and for
            landing directly on a /[sub] URL. scroll-mt clears the fixed navbar
            plus the sticky tab bar. */}
        <div id="industry-sub-content" className="scroll-mt-30 lg:scroll-mt-44">
          {children}
        </div>
      </div>

      {/* Fixed — sector-level, stays below all sub-sector content */}
      <WhyChooseSection
        industryName={industry.name}
        whyChoose={industry.whyChoose as unknown as { title: string; highlight: string; cards: { title: string; description: string }[] }}
      />

      <div id="enquiry-form">
        <IndustryEnquiryForm industryName={industry.name} />
      </div>
    </div>
  );
}
