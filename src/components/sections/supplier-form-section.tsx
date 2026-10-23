"use client";
import { HexIcon } from "@/components/ui/hex-icon";
import { CommonEnquiryFields } from "@/components/sections/common-enquiry-fields";
import type { IndustryOptionGroup } from "@/components/ui/industry-tree-combobox";
import type { FormFieldKey } from "@/lib/form-config-shared";

type SupplierFormSectionProps = {
  headingPrefix?: string;
  headingHighlight?: string;
  description?: string;
  industryOptions?: IndustryOptionGroup[];
  config: Record<FormFieldKey, boolean>;
};

const DEFAULT_BENEFITS = [
  "Access to a wide range of proven industrial solutions",
  "Opportunity to expand into multiple high-demand industries",
  "Strong margin potential with a scalable business model",
  "Reduced financial risk through partner-first practices",
  "Consistent support for sales, technical, and operations",
  "Long-term partnership focused on mutual growth",
];

export function SupplierFormSection({
  headingPrefix = "Grow Your Business",
  headingHighlight = "as a Supplier",
  description = "If you are looking to enrich your product offering portfolio. Apply for becoming our prestigious league of channel partners with us.",
  industryOptions = [],
  config,
}: SupplierFormSectionProps) {
  return (
    <section id="form" className="scroll-mt-24 lg:scroll-mt-32 bg-white pt-8 pb-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left copy */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-stone-900 text-2xl lg:text-4xl font-semibold font-montserrat leading-8 lg:leading-10">
              {headingPrefix} <span className="text-primary">{headingHighlight}</span>
            </h2>
            <p className="text-stone-500 text-sm lg:text-base font-medium font-montserrat leading-5 lg:leading-6">
              {description}
            </p>
          </div>

          <ul className="max-w-96 flex flex-col gap-4">
            {DEFAULT_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-1.5 shrink-0">
                  <HexIcon size={12} />
                </span>
                <span className="flex-1 text-stone-900 font-montserrat font-medium text-base leading-6">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form card */}
        <div className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200">
          <CommonEnquiryFields
            formKey="supplier"
            config={config}
            industryOptions={industryOptions}
            recaptchaAction="supplier_application"
            successMessage="Application submitted! We'll be in touch soon."
          />
        </div>
      </div>
    </section>
  );
}
