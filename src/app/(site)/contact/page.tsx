import type { Metadata } from "next";
import { ContactHeroSection } from "@/components/sections/contact-hero-section";
import { ContactFormSection } from "@/components/sections/contact-form-section";
import { ContactOfficesSection } from "@/components/sections/contact-offices-section";
import { fetchContactSection } from "@/lib/site-api";
import type { ContactOfficeTab } from "@/lib/contact-data";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { getFormConfig, getProductTypeConfig, getIndustryOptionsForForm } from "@/lib/form-config";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

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
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("contact"), SITE_METADATA_FALLBACK);
}

export default async function ContactPage() {
  const seo = await getPageSeo("contact");
  const [hero, offices, form, industryOptions, formConfig, productTypes] = await Promise.all([
    fetchContactSection<HeroData>("hero"),
    fetchContactSection<OfficesData>("offices"),
    fetchContactSection<FormData>("form"),
    getIndustryOptionsForForm("contact"),
    getFormConfig(),
    getProductTypeConfig(),
  ]);

  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
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
          industryOptions={industryOptions}
          config={formConfig.contact.fields}
          enquiryTypeOptions={formConfig.contact.enquiryTypeOrder}
          productTypeOptions={productTypes}
        />
      )}
    </div>
  );
}
