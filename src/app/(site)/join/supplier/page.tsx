import { SupplierHeroSection } from "@/components/sections/supplier-hero-section";
import { SupplierBenefitsSection } from "@/components/sections/supplier-benefits-section";
import { SupplierFormSection } from "@/components/sections/supplier-form-section";

export default function SupplierPage() {
  return (
    <div>
      <SupplierHeroSection />
      <SupplierBenefitsSection />
      <SupplierFormSection />
    </div>
  );
}
