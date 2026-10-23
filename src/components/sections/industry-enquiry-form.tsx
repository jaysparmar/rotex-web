"use client";
import { HexIcon } from "@/components/ui/hex-icon";
import { CommonEnquiryFields } from "@/components/sections/common-enquiry-fields";
import type { FormFieldKey } from "@/lib/form-config-shared";

export function IndustryEnquiryForm({
  industryName,
  config,
}: {
  industryName: string;
  config: Record<FormFieldKey, boolean>;
}) {
  return (
    <section className="bg-white py-12 lg:py-[120px]">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-[163px]">

        {/* Left info panel — same title, copy and steps at every breakpoint */}
        <div className="flex lg:w-[487px] shrink-0 flex-col gap-5 lg:gap-8">
          <div className="flex flex-col gap-3 lg:gap-4">
            <h2 className="text-gradient-orange-dark text-2xl lg:text-3xl font-medium font-montserrat leading-8 lg:leading-10">
              Find the Right Solution for Your Industry
            </h2>
            <p className="text-stone-500 text-sm lg:text-base font-medium font-montserrat leading-5 lg:leading-6">
              Connect with specialists for product support based on your industry, application, and operating requirements.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:gap-4">
            {[
              "Tell us your industry and application needs.",
              "Submit your enquiry for product guidance.",
              "Get matched with suitable automation solutions.",
              "Receive support from Rotex product specialists.",
              "Fill the form to start your product enquiry.",
            ].map((step) => (
              <div key={step} className="flex items-start gap-1 lg:gap-3">
                <span className="size-6 shrink-0 flex items-start justify-center pt-1.75 lg:pt-1">
                  <HexIcon size={12} />
                </span>
                <p className="flex-1 text-stone-900 text-sm lg:text-base font-medium font-montserrat leading-5 lg:leading-6">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200">
          <CommonEnquiryFields
            formKey="industry"
            config={config}
            fixedIndustryName={industryName}
            recaptchaAction="industry_enquiry"
            submitLabel="Send Enquiry"
            sendingLabel="Sending…"
            successMessage="Enquiry sent! We'll be in touch soon."
          />
        </div>
      </div>
    </section>
  );
}
