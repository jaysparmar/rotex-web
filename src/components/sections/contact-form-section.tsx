"use client";
import { ImageView } from "@/components/ui/image-view";
import { CommonEnquiryFields } from "@/components/sections/common-enquiry-fields";
import type { IndustryOptionGroup } from "@/components/ui/industry-tree-combobox";
import type { FormFieldKey } from "@/lib/form-config-shared";
import partner1 from "@/assets/Images/trustPartners/img_1.png";
import partner2 from "@/assets/Images/trustPartners/img_2.png";
import partner3 from "@/assets/Images/trustPartners/img_3.png";
import partner4 from "@/assets/Images/trustPartners/img_4.png";
import partner5 from "@/assets/Images/trustPartners/img_5.png";
import partner6 from "@/assets/Images/trustPartners/img_6.png";

const defaultLogos = [partner1, partner2, partner3, partner4, partner5, partner6].map((src, i) => ({
  id: String(i),
  src,
  alt: "Partner",
}));

type Logo = { id: string; src: string | import("next/image").StaticImageData; alt: string };

type ContactFormSectionProps = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  certificationsLabel?: string;
  certificationsText?: string;
  trustLabel?: string;
  logos?: Logo[];
  industryOptions?: IndustryOptionGroup[];
  config: Record<FormFieldKey, boolean>;
  enquiryTypeOptions?: readonly string[];
  productTypeOptions?: readonly { key: string; label: string }[];
};

export function ContactFormSection({
  eyebrow = "About Rotex",
  heading = "A Global Fluid Control Specialist",
  description = "With a presence across 30+ countries, we partner with leading OEMs, EPCs, and system integrators to deliver cutting-edge automation solutions. Our expertise spans control valves, actuators, and complete automation systems designed for mission-critical applications.",
  certificationsLabel = "Standards & Certifications",
  certificationsText = "ATEX, IECEx, PESO, CE, SIL 2 / SIL 3, PED, ISI / BIS, INMETRO, UL",
  trustLabel = "Trusted by industry leaders",
  logos = defaultLogos,
  industryOptions = [],
  config,
  enquiryTypeOptions,
  productTypeOptions,
}: ContactFormSectionProps) {
  return (
    <section id="contact-form" className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-16">
        {/* Left: About Rotex */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-14">
          <div className="flex flex-col gap-3">
            <span className="text-[#EF3E23] text-sm font-bold font-montserrat uppercase leading-5 tracking-wide">{eyebrow}</span>
            <h2 className="text-neutral-950 text-3xl font-medium font-montserrat leading-10">{heading}</h2>
            <p className="text-stone-500 text-base font-medium font-montserrat leading-6">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide whitespace-nowrap">
                {certificationsLabel}
              </span>
              <div className="flex-1 h-px bg-black/10" />
            </div>
            <p className="text-stone-900 text-base font-medium font-montserrat leading-6">
              {certificationsText}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide whitespace-nowrap">
                {trustLabel}
              </span>
              <div className="flex-1 h-px bg-black/10" />
            </div>
            <div className="grid grid-cols-4 gap-6">
              {logos.map((logo) => (
                <div key={logo.id} className="h-14 flex items-center justify-start">
                  <ImageView
                    src={logo.src}
                    alt={logo.alt}
                    width={160}
                    height={64}
                    className="object-contain max-h-14 max-w-full w-auto h-auto"
                    unoptimized={typeof logo.src === "string"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form card */}
        <div className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200">
          <CommonEnquiryFields
            formKey="contact"
            config={config}
            industryOptions={industryOptions}
            enquiryTypeOptions={enquiryTypeOptions}
            productTypeOptions={productTypeOptions}
            recaptchaAction="contact_form"
            submitLabel="Submit"
            successMessage="Message sent! We'll be in touch soon."
          />
        </div>
      </div>
    </section>
  );
}
