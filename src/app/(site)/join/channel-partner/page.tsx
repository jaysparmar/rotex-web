import { ChannelPartnerHeroSection } from "@/components/sections/channel-partner-hero-section";
import { ChannelPartnerStatsSection } from "@/components/sections/channel-partner-stats-section";
import { ChannelPartnerWhySection } from "@/components/sections/channel-partner-why-section";
import { ChannelPartnerBenefitsSection } from "@/components/sections/channel-partner-benefits-section";
import { ChannelPartnerMapSection } from "@/components/sections/channel-partner-map-section";
import { CustomerStoriesSection } from "@/components/sections/customer-stories-section";
import { ChannelPartnerFormSection } from "@/components/sections/channel-partner-form-section";
import { fetchChannelPartnerSection } from "@/lib/site-api";

type CtaButton = { label: string; href: string };
type HeroData = { title: string; description: string; image: string; mobileImage?: string; cta: CtaButton };
type StatsData = { stats: { value: string; label: string }[]; growthHeading: string; growthDescription: string };
type WhyData = { heading: string; description: string; cards: { title: string; points: string[] }[] };
type BenefitsData = { heading: string; benefits: { icon: string; text: string }[] };
type MapData = {
  heading: string;
  description: string;
  callout: string;
  pins: { name: string; stateOrCity: string | null; partnerCompany: string | null; coordinates: [number, number] }[];
};
type StoriesData = {
  heading: { title: string; subtitle: string };
  stories: { id: string; quote: string; author: string; company: string; image: string; mediaType?: string }[];
};
type FormData = {
  headingPrefix: string;
  headingHighlight: string;
  description: string;
  countryOptions: string[];
  cityOptions: string[];
  businessTypeOptions: string[];
  industryOptions: string[];
  defaultCountry: string;
};

export default async function ChannelPartnerPage() {
  const [hero, stats, why, benefits, map, stories, form] = await Promise.all([
    fetchChannelPartnerSection<HeroData>("hero"),
    fetchChannelPartnerSection<StatsData>("stats"),
    fetchChannelPartnerSection<WhyData>("why"),
    fetchChannelPartnerSection<BenefitsData>("benefits"),
    fetchChannelPartnerSection<MapData>("map"),
    fetchChannelPartnerSection<StoriesData>("stories"),
    fetchChannelPartnerSection<FormData>("form"),
  ]);

  return (
    <div>
      {hero?.enabled && (
        <ChannelPartnerHeroSection
          title={hero.title}
          description={hero.description}
          image={hero.image || undefined}
          mobileImage={hero.mobileImage || undefined}
          cta={hero.cta}
        />
      )}

      {stats?.enabled && (
        <ChannelPartnerStatsSection
          stats={stats.stats}
          growthHeading={stats.growthHeading}
          growthDescription={stats.growthDescription}
        />
      )}

      {why?.enabled && (
        <ChannelPartnerWhySection heading={why.heading} description={why.description} cards={why.cards} />
      )}

      {benefits?.enabled && (
        <ChannelPartnerBenefitsSection heading={benefits.heading} benefits={benefits.benefits} />
      )}

      {map?.enabled && map.pins.length > 0 && (
        <ChannelPartnerMapSection
          heading={map.heading}
          description={map.description}
          callout={map.callout}
          pins={map.pins}
        />
      )}

      {stories?.enabled && stories.stories.length > 0 && (
        <CustomerStoriesSection heading={stories.heading} stories={stories.stories} />
      )}

      {form?.enabled && (
        <ChannelPartnerFormSection
          headingPrefix={form.headingPrefix}
          headingHighlight={form.headingHighlight}
          description={form.description}
          countryOptions={form.countryOptions}
          cityOptions={form.cityOptions}
          businessTypeOptions={form.businessTypeOptions}
          industryOptions={form.industryOptions}
          defaultCountry={form.defaultCountry}
        />
      )}
    </div>
  );
}
