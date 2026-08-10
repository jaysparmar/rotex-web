import { ContactHeroSection } from "@/components/sections/contact-hero-section";
import { ContactFormSection } from "@/components/sections/contact-form-section";
import { ContactOfficesSection } from "@/components/sections/contact-offices-section";
import { fetchContactSection, fetchIndustries } from "@/lib/site-api";
import { INDUSTRY_OPTIONS, type ContactOfficeTab } from "@/lib/contact-data";

type HeroData = { breadcrumbLabel: string; title: string; description: string; ctaLabel: string };
type OfficesData = { heading: string; description: string; tabs: ContactOfficeTab[] };
type FormData = {
  eyebrow: string;
  heading: string;
  description: string;
  certificationsLabel: string;
  certificationsText: string;
  trustLabel: string;
  logos: { id: string; src: string; alt: string }[];
  enquiryTypeOptions: string[];
  productTypeOptions: string[];
  countryOptions: string[];
  cityOptions: string[];
  defaultCountry: string;
};
type IndustriesData = { industries: { id: string; slug: string; name: string }[] };

export default async function ContactPage() {
  const [hero, offices, form, industriesData] = await Promise.all([
    fetchContactSection<HeroData>("hero"),
    fetchContactSection<OfficesData>("offices"),
    fetchContactSection<FormData>("form"),
    fetchIndustries<IndustriesData>(),
  ]);

  const liveIndustryNames = industriesData?.industries.map((i) => i.name) ?? [];
  const industryOptions = liveIndustryNames.length > 0 ? liveIndustryNames : INDUSTRY_OPTIONS;

  return (
    <div>
      {hero?.enabled && (
        <ContactHeroSection
          breadcrumbLabel={hero.breadcrumbLabel}
          title={hero.title}
          description={hero.description}
          ctaLabel={hero.ctaLabel}
        />
      )}

      {offices?.enabled && (
        <ContactOfficesSection heading={offices.heading} description={offices.description} tabs={offices.tabs} />
      )}

      {form?.enabled && (
        <ContactFormSection
          eyebrow={form.eyebrow}
          heading={form.heading}
          description={form.description}
          certificationsLabel={form.certificationsLabel}
          certificationsText={form.certificationsText}
          trustLabel={form.trustLabel}
          logos={form.logos}
          enquiryTypeOptions={form.enquiryTypeOptions}
          productTypeOptions={form.productTypeOptions}
          countryOptions={form.countryOptions}
          cityOptions={form.cityOptions}
          industryOptions={industryOptions}
          defaultCountry={form.defaultCountry}
        />
      )}
    </div>
  );
}
