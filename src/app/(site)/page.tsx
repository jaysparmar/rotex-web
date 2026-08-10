import { fetchHomeSection, fetchIndustries, fetchCategories } from "@/lib/site-api";
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
type ProductsHeadingData = { heading: { title: string }; cta: { label: string; href: string } };
type CategoryCard = { id: string; slug: string; name: string; tagline: string; image: string | null };

export default async function Home() {
  const hero = await fetchHomeSection<HeroData>("hero");
  const partners = await fetchHomeSection<PartnersData>("partners");
  const redefining = await fetchHomeSection<RedefiningData>("redefining");
  const industriesSection = await fetchHomeSection<IndustriesHeadingData>("industries");
  const industriesList = await fetchIndustries<{ industries: IndustryCard[] }>();
  const products = await fetchHomeSection<ProductsHeadingData>("products");
  const categoriesList = await fetchCategories<{ categories: CategoryCard[] }>();
  const certifications = await fetchHomeSection<CertificationsData>("certifications");
  const customerStories = await fetchHomeSection<CustomerStoriesData>("customer-stories");
  const resources = await fetchHomeSection<ResourcesData>("resources");
  const resourceTabs = resources?.tabs.filter((t) => t.resources.length > 0) ?? [];
  const cta = await fetchHomeSection<object>("cta");
  const heroVisible = Boolean(hero?.enabled && hero.slides.length > 0);

  return (
    <div className={heroVisible ? undefined : "pt-20 lg:pt-24"}>
      {heroVisible && <HeroSection slides={hero!.slides} />}
      {partners?.enabled && partners.logos.length > 0 && (
        <TrustedLeaders title={partners.title} logos={partners.logos} />
      )}
      {redefining?.enabled && (
        <RedefiningSection
          heading={redefining.heading}
          media={redefining.media}
          tagline={redefining.tagline}
          stats={redefining.stats}
        />
      )}
      {industriesSection?.enabled && industriesList && industriesList.industries.length > 0 && (
        <IndustriesSection heading={industriesSection.heading} industries={industriesList.industries} />
      )}
      {products?.enabled && categoriesList && categoriesList.categories.length > 0 && (
        <ProductsSection
          heading={products.heading}
          cta={products.cta}
          categories={categoriesList.categories}
        />
      )}
      {certifications?.enabled && certifications.logos.length > 0 && (
        <TrustedLeaders title={certifications.title} logos={certifications.logos} primary />
      )}
      {customerStories?.enabled && customerStories.stories.length > 0 && (
        <CustomerStoriesSection heading={customerStories.heading} stories={customerStories.stories} />
      )}
      {resources?.enabled && resourceTabs.length > 0 && (
        <LearnSection heading={resources.heading.title} tabs={resourceTabs} />
      )}
      {cta?.enabled && <CtaSection />}
    </div>
  );
}
