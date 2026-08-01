import { ContactHeroSection } from "@/components/sections/contact-hero-section";
import { ContactFormSection } from "@/components/sections/contact-form-section";
import { ContactOfficesSection } from "@/components/sections/contact-offices-section";

export default function ContactPage() {
  return (
    <div>
      <ContactHeroSection />
      <ContactOfficesSection />
      <ContactFormSection />
    </div>
  );
}
