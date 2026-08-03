import { PillButton } from "@/components/ui/pill-button";

type ZeroDowntimeCtaSectionProps = {
  title?: string;
  description?: string;
};

const CTA_SHADOW = "shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)]";

export function ZeroDowntimeCtaSection({
  title = "Ready to engineer Zero Downtime into your plant?",
  description = "The N2W Zero Downtime Consultation applies 58 years of field-validated engineering to your specific plant - and identifies the failure modes most likely to cause your next shutdown. 45 minutes. No sales content. Written analysis in 48 hours.",
}: ZeroDowntimeCtaSectionProps) {
  return (
    <section className="py-16 lg:py-20">
      {/* Figma: 1064px card, 56px padding, 30px radius, orange→black radial */}
      <div className="container mx-auto max-w-266">
        <div className="rounded-[30px] overflow-hidden bg-gradient-orange-black-radial p-8 lg:p-14 flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-white font-montserrat font-medium text-2xl lg:text-3xl leading-8 lg:leading-10">
              {title}
            </h2>
            <p className="text-subtext font-montserrat font-medium text-sm lg:text-base leading-6 lg:max-w-176.5">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:gap-5">
            <PillButton
              href="/contact"
              tone="lightOrange"
              size="md"
              className={`font-bold ${CTA_SHADOW}`}
            >
              Book Free Consultation
            </PillButton>
            <PillButton
              href="/downloads"
              tone="dark"
              size="md"
              className={`font-bold outline-1 -outline-offset-1 outline-primary ${CTA_SHADOW}`}
            >
              Download N2W Framework
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
