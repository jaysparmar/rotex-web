import { CareerHeroSection } from "@/components/sections/career-hero-section";
import { CareerValuesSection } from "@/components/sections/career-values-section";
import { CareerGallerySection } from "@/components/sections/career-gallery-section";
import { CareerWhySection } from "@/components/sections/career-why-section";
import { CareerOpenPositionsSection } from "@/components/sections/career-open-positions-section";
import { CareerFormSection } from "@/components/sections/career-form-section";

export default function CareerPage() {
  return (
    <div>
      <CareerHeroSection />
      <CareerValuesSection />
      <CareerGallerySection />
      <CareerWhySection />
      <CareerOpenPositionsSection />
      <CareerFormSection />
    </div>
  );
}
