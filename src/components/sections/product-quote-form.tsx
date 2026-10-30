"use client";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CommonEnquiryFields } from "@/components/sections/common-enquiry-fields";
import type { FormFieldKey } from "@/lib/form-config-shared";

type QuoteFormProps = {
  productCode: string;
  productName: string;
  industries: string[];
  config: Record<FormFieldKey, boolean>;
};

// Product-tagged industries are a flat list (no parent/sub grouping), so each
// just becomes its own selectable group with no children.
function toIndustryGroups(industries: string[]) {
  return industries.map((name) => ({ name, selectable: true, subIndustries: [] }));
}

// ── Inline section (simple products) ─────────────────────────────────────────────

export function ProductQuoteFormInline({ productCode, productName, industries, config }: QuoteFormProps) {
  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
      <div className="flex lg:w-116 shrink-0 flex-col gap-4">
        <h2 className="text-gradient-orange-dark text-3xl lg:text-5xl font-normal font-montserrat leading-tight">
          Request a Quote
        </h2>
        <p className="text-stone-500 text-base font-medium font-montserrat leading-6">
          Submit your application details to receive accurate pricing, lead time, and configuration options
        </p>
      </div>

      <div className="w-full lg:max-w-158 p-5 lg:p-7 bg-white rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200">
        <CommonEnquiryFields
          formKey="product-quote"
          config={config}
          industryOptions={toIndustryGroups(industries)}
          fixedProduct={`${productName} (${productCode})`}
          recaptchaAction="product_quote"
          submitLabel="Submit"
          sendingLabel="Sending…"
          successMessage="Enquiry sent! We'll be in touch soon."
        />
      </div>
    </div>
  );
}

// ── Sheet / drawer (variant products) ─────────────────────────────────────────────

export function ProductQuoteFormSheet({
  open,
  onOpenChange,
  productCode,
  productName,
  industries,
  config,
}: QuoteFormProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Sheet slides in from the right on desktop (matches Figma), but a right-edge
  // drawer at 3/4 viewport width is too narrow for this form's two-column rows
  // on phones — switch to a full-width bottom sheet under the sm breakpoint.
  const [side, setSide] = useState<"right" | "bottom">("right");
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => setSide(e.matches ? "bottom" : "right");
    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=bottom]:max-h-[90vh] data-[side=bottom]:rounded-t-2xl overflow-y-auto p-0 gap-0"
      >
        <SheetHeader className="p-6 pb-0 gap-2">
          <SheetTitle className="text-orange-600 text-3xl font-normal font-montserrat leading-tight">
            Request a Quote
          </SheetTitle>
          <SheetDescription className="text-stone-500 text-sm font-medium font-montserrat leading-6">
            Submit your application details to receive accurate pricing, lead time, and configuration options
          </SheetDescription>
        </SheetHeader>

        <div className="p-6">
          <CommonEnquiryFields
            formKey="product-quote"
            config={config}
            industryOptions={toIndustryGroups(industries)}
            fixedProduct={`${productName} (${productCode})`}
            recaptchaAction="product_quote"
            submitLabel="Submit"
            sendingLabel="Sending…"
            successMessage="Enquiry sent! We'll be in touch soon."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
