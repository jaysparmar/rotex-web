"use client";
import { useState } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_COUNTRIES = ["United States", "India", "UAE", "Saudi Arabia", "United Kingdom", "Germany"];
const DEFAULT_CITIES = ["Mumbai", "Delhi", "Dubai", "London", "Berlin", "New York"];
const DEFAULT_BUSINESS_TYPES = ["Distributor", "Supplier", "System Integrator", "OEM Partner"];
const DEFAULT_INDUSTRIES = ["Oil & Gas", "Chemical", "Power", "Mining", "Industrial Automation"];

const labelCls = "text-stone-500 text-sm font-medium font-montserrat leading-5";
const errorCls = "text-red-500 text-xs font-montserrat mt-0.5";

function inputCls(hasError: boolean) {
  return `w-full px-5 py-3 h-12 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none ${
    hasError ? "outline-red-400" : "outline-gray-200"
  }`;
}

function selectTriggerCls(hasError: boolean) {
  return `w-full h-auto px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline outline-1 -outline-offset-1 text-base font-medium font-montserrat text-zinc-800 data-placeholder:text-neutral-400 ${
    hasError ? "outline-red-400" : "outline-gray-200"
  }`;
}

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().min(1, "Company name is required"),
  phone: z.string().min(10, "Enter a valid 10-digit number").max(15).regex(/^\d+$/, "Digits only"),
  email: z.string().email("Enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(1, "Please select a city"),
  businessType: z.string().min(1, "Please select a business type"),
  industriesServed: z.string().min(1, "Please select an industry"),
  otherIndustriesServed: z.string().optional(),
  message: z.string().min(10, "Tell us a bit more (at least 10 characters)"),
});

type FormData = z.infer<typeof schema>;

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

function FormSelect({
  control,
  name,
  placeholder,
  options,
  hasError,
}: {
  control: Control<FormData>;
  name: "country" | "city" | "businessType" | "industriesServed";
  placeholder: string;
  options: string[];
  hasError: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v ?? "")}>
          <SelectTrigger className={selectTriggerCls(hasError)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4L6 8L10 4" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type SupplierFormSectionProps = {
  headingPrefix?: string;
  headingHighlight?: string;
  description?: string;
  countryOptions?: string[];
  cityOptions?: string[];
  businessTypeOptions?: string[];
  industryOptions?: string[];
  defaultCountry?: string;
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
  headingPrefix = "Grow Your Business as a",
  headingHighlight = "Supplier",
  description = "If you are looking to enrich your product offering portfolio. Apply for becoming our prestigious league of channel partners with us.",
  countryOptions = DEFAULT_COUNTRIES,
  cityOptions = DEFAULT_CITIES,
  businessTypeOptions = DEFAULT_BUSINESS_TYPES,
  industryOptions = DEFAULT_INDUSTRIES,
  defaultCountry = "United States",
}: SupplierFormSectionProps) {
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: defaultCountry },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(undefined);

    const body = new FormData();
    body.append("industryName", data.otherIndustriesServed?.trim() || data.industriesServed);
    body.append("fullName", data.fullName);
    body.append("enquiryType", data.businessType);
    body.append("product", "Supplier Application");
    body.append("phone", data.phone);
    body.append("email", data.email);
    body.append("country", data.country);
    body.append("city", data.city);
    body.append("company", data.companyName);
    body.append("message", data.message);

    const res = await fetch("/api/v1/enquiries", { method: "POST", body });
    const json = await res.json();

    if (!json.success) {
      setSubmitError(json.error?.message ?? "Failed to submit your application. Please try again.");
      throw new Error(json.error?.message ?? "Failed to submit supplier application");
    }
  };

  return (
    <section id="form" className="scroll-mt-24 lg:scroll-mt-32 bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left copy */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-stone-900 text-2xl lg:text-4xl font-normal font-montserrat leading-9 lg:leading-10">
              {headingPrefix} <span className="text-gradient-hero">{headingHighlight}</span>
            </h2>
            <p className="text-stone-500 text-base font-medium font-montserrat leading-6">
              {description}
            </p>
          </div>

          <ul className="max-w-96 flex flex-col gap-4">
            {DEFAULT_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-1.5 size-3 shrink-0 bg-red-600" />
                <span className="flex-1 text-stone-900 font-montserrat font-medium text-base leading-6">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-6"
        >
          <Field label="Full Name" error={errors.fullName?.message}>
            <input {...register("fullName")} placeholder="e.g. John Doe" className={inputCls(!!errors.fullName)} />
          </Field>

          <Field label="Company Name" error={errors.companyName?.message}>
            <input {...register("companyName")} placeholder="e.g. Rotex automation" className={inputCls(!!errors.companyName)} />
          </Field>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1 flex flex-col gap-2">
              <label className={labelCls}>Phone number</label>
              <div className={`flex bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 overflow-hidden ${errors.phone ? "outline-red-400" : "outline-gray-200"}`}>
                <div className="px-3 py-2.5 border-r border-gray-200 flex items-center gap-2 shrink-0">
                  <span className="text-stone-900 text-sm font-medium font-montserrat leading-5">+91</span>
                  <ChevronDown />
                </div>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="Enter phone number"
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none"
                />
              </div>
              {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
            </div>

            <Field label="Email" error={errors.email?.message} className="flex-1">
              <input {...register("email")} type="email" placeholder="e.g. abc@gmail.com" className={inputCls(!!errors.email)} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Country" error={errors.country?.message} className="flex-1">
              <FormSelect control={control} name="country" placeholder="Select Country" options={countryOptions} hasError={!!errors.country} />
            </Field>

            <Field label="City" error={errors.city?.message} className="flex-1">
              <FormSelect control={control} name="city" placeholder="Select City" options={cityOptions} hasError={!!errors.city} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Business Type" error={errors.businessType?.message} className="flex-1">
              <FormSelect control={control} name="businessType" placeholder="Business Type" options={businessTypeOptions} hasError={!!errors.businessType} />
            </Field>

            <Field label="Industries Served" error={errors.industriesServed?.message} className="flex-1">
              <FormSelect control={control} name="industriesServed" placeholder="Select" options={industryOptions} hasError={!!errors.industriesServed} />
            </Field>
          </div>

          <Field label="Other Industries Served">
            <input
              {...register("otherIndustriesServed")}
              placeholder="e.g. Energy, Chemicals, Packaging, Textiles"
              className={inputCls(false)}
            />
          </Field>

          <Field label="Your Message" error={errors.message?.message}>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Share any additional details about your business or partnership interest..."
              className={`w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none resize-none ${errors.message ? "outline-red-400" : "outline-gray-200"}`}
            />
          </Field>

          {submitError && <p className="text-sm font-medium font-montserrat text-red-600">{submitError}</p>}

          {isSubmitSuccessful ? (
            <p className="text-sm font-medium font-montserrat text-green-600">
              Application submitted! We&apos;ll be in touch soon.
            </p>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full lg:w-fit px-6 py-3.5 bg-stone-900 rounded-full text-white text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-primary transition-colors duration-150 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit all details"}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
