"use client";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterCombobox } from "@/components/ui/filter-combobox";
import { PRODUCT_FAMILIES } from "@/lib/product-constants";
import { COUNTRY_NAMES, getCitiesForCountry } from "@/lib/world-countries";
import { digitsOnlyKeyDown } from "@/lib/utils";

const DEFAULT_BUSINESS_TYPES = ["Distributor", "Supplier", "System Integrator", "OEM Partner"];
const DEFAULT_INDUSTRIES = ["Oil & Gas", "Chemical", "Power", "Mining", "Industrial Automation"];
const DEFAULT_PRODUCT_TYPES = [...PRODUCT_FAMILIES];

const labelCls = "text-stone-500 text-sm font-medium font-montserrat leading-5";
const inputCls = "w-full px-5 py-3 h-12 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 text-sm font-medium font-montserrat text-stone-900 placeholder:text-stone-400";
const selectTriggerCls = "w-full h-auto px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline outline-1 -outline-offset-1 outline-gray-200 text-sm font-medium font-montserrat text-zinc-800 data-placeholder:text-stone-400";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function FormSelect({
  placeholder,
  options,
  value,
  onValueChange,
}: {
  placeholder: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select
      items={options.map((o) => ({ value: o, label: o }))}
      value={value}
      onValueChange={(v) => onValueChange(v ?? "")}
    >
      <SelectTrigger className={selectTriggerCls}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4L6 8L10 4" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type ChannelPartnerFormSectionProps = {
  headingPrefix?: string;
  headingHighlight?: string;
  description?: string;
  /** @deprecated Country field now uses the full world country list with search. */
  countryOptions?: string[];
  /** @deprecated City options are now derived from the selected country. */
  cityOptions?: string[];
  businessTypeOptions?: string[];
  industryOptions?: string[];
  productTypeOptions?: string[];
  /** @deprecated Country field no longer preselects a value; placeholder shows by default. */
  defaultCountry?: string;
};

export function ChannelPartnerFormSection({
  headingPrefix = "Expand Your Industrial Portfolio with a",
  headingHighlight = "Globally Trusted Manufacturer",
  description = "Partner with Rotex to deliver high-performance fluid control solutions backed by engineering excellence, global reach, and consistent demand generation.",
  businessTypeOptions = DEFAULT_BUSINESS_TYPES,
  industryOptions = DEFAULT_INDUSTRIES,
  productTypeOptions = DEFAULT_PRODUCT_TYPES,
}: ChannelPartnerFormSectionProps) {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [industriesServed, setIndustriesServed] = useState("");
  const [productType, setProductType] = useState("");
  const cityOptions = useMemo(() => getCitiesForCountry(country), [country]);

  return (
    <section id="form" className="scroll-mt-24 lg:scroll-mt-32 bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left copy */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-4">
          <h2 className="text-stone-900 text-2xl lg:text-4xl font-normal font-montserrat leading-10 lg:leading-[3.25rem]">
            {headingPrefix}{" "}
            <span className="text-gradient-orange-dark">{headingHighlight}</span>
          </h2>
          <p className="text-stone-500 text-base font-medium font-montserrat leading-6">
            {description}
          </p>
        </div>

        {/* Form card */}
        <form className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-6">
          <Field label="Full Name">
            <input name="fullName" placeholder="e.g. John Doe" className={inputCls} />
          </Field>

          <Field label="Company Name">
            <input name="companyName" placeholder="e.g. Rotex automation" className={inputCls} />
          </Field>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1 flex flex-col gap-2">
              <label className={labelCls}>Phone number</label>
              <div className="flex bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 overflow-hidden">
                <div className="px-3 py-2.5 border-r border-gray-200 flex items-center gap-2 shrink-0">
                  <span className="text-stone-900 text-sm font-medium font-montserrat leading-5">+91</span>
                  <ChevronDown />
                </div>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  onKeyDown={digitsOnlyKeyDown}
                  placeholder="Enter phone number"
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm font-medium font-montserrat text-stone-900 placeholder:text-stone-400 outline-none"
                />
              </div>
            </div>

            <Field label="Email" className="flex-1">
              <input name="email" type="email" placeholder="e.g. abc@gmail.com" className={inputCls} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1">
              <FilterCombobox
                label="Country"
                placeholder="Select Country"
                options={COUNTRY_NAMES}
                value={country ? [country] : []}
                onChange={(v) => {
                  setCountry(v[0] ?? "");
                  setCity("");
                }}
                multiple={false}
              />
            </div>

            <div className="flex-1">
              <FilterCombobox
                label="City"
                placeholder={country ? "Select City" : "Select a country first"}
                options={cityOptions}
                value={city ? [city] : []}
                onChange={(v) => setCity(v[0] ?? "")}
                multiple={false}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Business Type" className="flex-1">
              <FormSelect placeholder="Select Business Type" options={businessTypeOptions} value={businessType} onValueChange={setBusinessType} />
            </Field>

            <Field label="Industries Served" className="flex-1">
              <FormSelect placeholder="Select Industries Served" options={industryOptions} value={industriesServed} onValueChange={setIndustriesServed} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Product Type" className="flex-1">
              <FormSelect placeholder="Select Product Type" options={productTypeOptions} value={productType} onValueChange={setProductType} />
            </Field>

            <Field label="Other Industries Served" className="flex-1">
              <input
                name="otherIndustriesServed"
                placeholder="e.g. Energy, Chemicals, Packaging, Textiles"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Your Message">
            <textarea
              name="message"
              rows={4}
              placeholder="Share any additional details about your business or partnership interest..."
              className="w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 text-sm font-medium font-montserrat text-stone-900 placeholder:text-stone-400 resize-none"
            />
          </Field>

          <button
            type="submit"
            disabled
            className="w-full lg:w-fit px-6 py-3.5 bg-stone-900 rounded-full text-white text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-primary transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit all details
          </button>
        </form>
      </div>
    </section>
  );
}
