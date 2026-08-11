import type { ReactElement } from "react";
import { fetchHomeSection, fetchIndustries } from "@/lib/site-api";
import { HeroSection } from "@/components/sections/hero-section";
import { TrustedLeaders } from "@/components/sections/trusted-leaders";
import { RedefiningSection } from "@/components/sections/redefining-section";
import { IndustriesSection } from "@/components/sections/industries-section";
import { ProductsSection } from "@/components/sections/products-section";
import { CustomerStoriesSection } from "@/components/sections/customer-stories-section";
import { LearnSection } from "@/components/sections/learn-section";
import { CtaSection } from "@/components/sections/cta-section";

type HeroData = {
  slides: {
    id: string;
    published?: boolean;
    title: string;
    description: string;
    media: { type: "image" | "video"; src: string; alt?: string };
    cta_buttons: { label: string; href: string }[];
  }[];
};
type PartnersData = { title: string; logos: { id: string; src: string; alt: string }[] };
type CertificationsData = {
  title: string;
  description?: string;
  logos: { id: string; src: string; alt: string }[];
};
type CustomerStoriesData = {
  heading: { title: string; subtitle: string };
  stories: { id: string; quote: string; author: string; company: string; image: string; mediaType?: string }[];
};
type RedefiningData = {
  heading: { title: string; subtitle: string };
  media: { type: "image" | "video"; src: string; alt?: string };
  tagline: { prefix: string; highlight: string; suffix: string };
  stats: { id: string; value: number; suffix: string; label: string; format_comma: boolean; published: boolean }[];
};
type ResourcesData = {
  heading: { title: string };
  tabs: {
    id: string;
    label: string;
    cta: { label: string; href: string };
    resources: { slug: string; title: string; image: string }[];
  }[];
};
type IndustriesHeadingData = { heading: { title: string; subtitle: string } };
type IndustryCard = { id: string; slug: string; name: string; description: string; image: string };

export default async function Home() {
  const hero = await fetchHomeSection<HeroData>("hero");
  const partners = await fetchHomeSection<PartnersData>("partners");
  const redefining = await fetchHomeSection<RedefiningData>("redefining");
  const industriesSection = await fetchHomeSection<IndustriesHeadingData>("industries");
  const industriesList = await fetchIndustries<{ industries: IndustryCard[] }>();
  const products = await fetchHomeSection<object>("products");
  const certifications = await fetchHomeSection<CertificationsData>("certifications");
  const customerStories = await fetchHomeSection<CustomerStoriesData>("customer-stories");
  const resources = await fetchHomeSection<ResourcesData>("resources");
  const resourceTabs = resources?.tabs.filter((t) => t.resources.length > 0) ?? [];
  const cta = await fetchHomeSection<object>("cta");
  const heroVisible = Boolean(hero?.enabled && hero.slides.length > 0);

  const sections = [
    { order: hero?.order ?? 0, node: heroVisible ? <HeroSection key="hero" slides={hero!.slides} /> : null },
    {
      order: partners?.order ?? 0,
      node:
        partners?.enabled && partners.logos.length > 0 ? (
          <TrustedLeaders key="partners" title={partners.title} logos={partners.logos} />
        ) : null,
    },
    {
      order: redefining?.order ?? 0,
      node: redefining?.enabled ? (
        <RedefiningSection
          key="redefining"
          heading={redefining.heading}
          media={redefining.media}
          tagline={redefining.tagline}
          stats={redefining.stats}
        />
      ) : null,
    },
    {
      order: industriesSection?.order ?? 0,
      node:
        industriesSection?.enabled && industriesList && industriesList.industries.length > 0 ? (
          <IndustriesSection
            key="industries"
            heading={industriesSection.heading}
            industries={industriesList.industries}
          />
        ) : null,
    },
    { order: products?.order ?? 0, node: products?.enabled ? <ProductsSection key="products" /> : null },
    {
      order: certifications?.order ?? 0,
      node:
        certifications?.enabled && certifications.logos.length > 0 ? (
          <TrustedLeaders key="certifications" title={certifications.title} logos={certifications.logos} primary />
        ) : null,
    },
    {
      order: customerStories?.order ?? 0,
      node:
        customerStories?.enabled && customerStories.stories.length > 0 ? (
          <CustomerStoriesSection key="customer-stories" heading={customerStories.heading} stories={customerStories.stories} />
        ) : null,
    },
    {
      order: resources?.order ?? 0,
      node:
        resources?.enabled && resourceTabs.length > 0 ? (
          <LearnSection key="resources" heading={resources.heading.title} tabs={resourceTabs} />
        ) : null,
    },
    { order: cta?.order ?? 0, node: cta?.enabled ? <CtaSection key="cta" /> : null },
  ]
    .sort((a, b) => a.order - b.order)
    .map((s) => s.node)
    .filter((node): node is ReactElement => node !== null);

  return <div className={heroVisible ? undefined : "pt-20 lg:pt-24"}>{sections}</div>;
}
