import { SupplierHeroSection } from "@/components/sections/supplier-hero-section";
import { SupplierBenefitsSection } from "@/components/sections/supplier-benefits-section";
import { SupplierFormSection } from "@/components/sections/supplier-form-section";
import { fetchSupplierSection } from "@/lib/site-api";

type CtaButton = { label: string; href: string };
type HeroData = { title: string; description: string; image: string; cta: CtaButton };
type BenefitsData = {
  heading: string;
  description: string;
  stats: { value: string; label: string }[];
  benefits: string[];
  cta: CtaButton;
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

export default async function SupplierPage() {
  const [hero, benefits, form] = await Promise.all([
    fetchSupplierSection<HeroData>("hero"),
    fetchSupplierSection<BenefitsData>("benefits"),
    fetchSupplierSection<FormData>("form"),
  ]);

  return (
    <div>
      {hero?.enabled && (
        <SupplierHeroSection
          title={hero.title}
          description={hero.description}
          image={hero.image || undefined}
          cta={hero.cta}
        />
      )}

      {benefits?.enabled && (
        <SupplierBenefitsSection
          heading={benefits.heading}
          description={benefits.description}
          stats={benefits.stats}
          benefits={benefits.benefits}
          cta={benefits.cta}
        />
      )}

      {form?.enabled && (
        <SupplierFormSection
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
