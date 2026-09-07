"use client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_COUNTRIES = ["United States", "India", "UAE", "Saudi Arabia", "United Kingdom", "Germany"];
const DEFAULT_CITIES = ["Mumbai", "Delhi", "Dubai", "London", "Berlin", "New York"];
const DEFAULT_BUSINESS_TYPES = ["Distributor", "Supplier", "System Integrator", "OEM Partner"];
const DEFAULT_INDUSTRIES = ["Oil & Gas", "Chemical", "Power", "Mining", "Industrial Automation"];

const labelCls = "text-stone-500 text-sm font-medium font-montserrat leading-5";
const inputCls = "w-full px-5 py-3 h-12 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400";
const selectTriggerCls = "w-full h-auto px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-zinc-800 data-placeholder:text-neutral-400";

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
  countryOptions?: string[];
  cityOptions?: string[];
  businessTypeOptions?: string[];
  industryOptions?: string[];
  defaultCountry?: string;
};

export function ChannelPartnerFormSection({
  headingPrefix = "Expand Your Industrial Portfolio with a",
  headingHighlight = "Globally Trusted Manufacturer",
  description = "Partner with Rotex to deliver high-performance fluid control solutions backed by engineering excellence, global reach, and consistent demand generation.",
  countryOptions = DEFAULT_COUNTRIES,
  cityOptions = DEFAULT_CITIES,
  businessTypeOptions = DEFAULT_BUSINESS_TYPES,
  industryOptions = DEFAULT_INDUSTRIES,
  defaultCountry = "United States",
}: ChannelPartnerFormSectionProps) {
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [industriesServed, setIndustriesServed] = useState("");

  return (
    <section id="form" className="scroll-mt-24 lg:scroll-mt-32 bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left copy */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-4">
          <h2 className="text-stone-900 text-2xl lg:text-4xl font-normal font-montserrat leading-9 lg:leading-10">
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
                  placeholder="Enter phone number"
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            <Field label="Email" className="flex-1">
              <input name="email" type="email" placeholder="e.g. abc@gmail.com" className={inputCls} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Country" className="flex-1">
              <FormSelect placeholder="Select Country" options={countryOptions} value={country} onValueChange={setCountry} />
            </Field>

            <Field label="City" className="flex-1">
              <FormSelect placeholder="Select City" options={cityOptions} value={city} onValueChange={setCity} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Business Type" className="flex-1">
              <FormSelect placeholder="Business Type" options={businessTypeOptions} value={businessType} onValueChange={setBusinessType} />
            </Field>

            <Field label="Industries Served" className="flex-1">
              <FormSelect placeholder="Select" options={industryOptions} value={industriesServed} onValueChange={setIndustriesServed} />
            </Field>
          </div>

          <Field label="Other Industries Served">
            <input
              name="otherIndustriesServed"
              placeholder="e.g. Energy, Chemicals, Packaging, Textiles"
              className={inputCls}
            />
          </Field>

          <Field label="Your Message">
            <textarea
              name="message"
              rows={4}
              placeholder="Share any additional details about your business or partnership interest..."
              className="w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 resize-none"
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
