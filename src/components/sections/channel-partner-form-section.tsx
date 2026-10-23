"use client";
import { CommonEnquiryFields } from "@/components/sections/common-enquiry-fields";
import type { IndustryOptionGroup } from "@/components/ui/industry-tree-combobox";
import type { FormFieldKey } from "@/lib/form-config-shared";

type ChannelPartnerFormSectionProps = {
  headingPrefix?: string;
  headingHighlight?: string;
  description?: string;
  industryOptions?: IndustryOptionGroup[];
  config: Record<FormFieldKey, boolean>;
};

export function ChannelPartnerFormSection({
  headingPrefix = "Expand Your Industrial Portfolio with a",
  headingHighlight = "Globally Trusted Manufacturer",
  description = "Partner with Rotex to deliver high-performance fluid control solutions backed by engineering excellence, global reach, and consistent demand generation.",
  industryOptions = [],
  config,
}: ChannelPartnerFormSectionProps) {
  return (
    <section id="form" className="scroll-mt-24 lg:scroll-mt-32 bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left copy */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-4">
          <h2 className="text-stone-900 text-2xl lg:text-4xl font-medium font-montserrat leading-8 lg:leading-10">
            {headingPrefix}{" "}
            <span className="text-gradient-orange-dark">{headingHighlight}</span>
          </h2>
          <p className="text-stone-500 text-sm lg:text-base font-medium font-montserrat leading-5 lg:leading-6">
            {description}
          </p>
        </div>

        {/* Form card */}
        <div className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200">
          <CommonEnquiryFields
            formKey="channel-partner"
            config={config}
            industryOptions={industryOptions}
            recaptchaAction="channel_partner_application"
            successMessage="Application submitted! We'll be in touch soon."
          />
        </div>
      </div>
    </section>
  );
}
