"use client";
import { useMemo, useState } from "react";
import { digitsOnlyKeyDown, scrollToFirstFormError } from "@/lib/utils";
import { useForm, useWatch, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterCombobox } from "@/components/ui/filter-combobox";
import { HexIcon } from "@/components/ui/hex-icon";
import { HoneypotFields } from "@/components/ui/honeypot-fields";
import { PhoneCodeSelect } from "@/components/ui/phone-code-select";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { RECAPTCHA_TOKEN_FIELD } from "@/lib/spam-protection-fields";
import { PRODUCT_FAMILIES } from "@/lib/product-constants";
import { COUNTRY_NAMES, getCitiesForCountry } from "@/lib/world-countries";

const DEFAULT_BUSINESS_TYPES = ["Distributor", "Supplier", "System Integrator", "OEM Partner"];
const DEFAULT_INDUSTRIES = ["Oil & Gas", "Chemical", "Power", "Mining", "Industrial Automation"];
const DEFAULT_PRODUCT_TYPES = [...PRODUCT_FAMILIES];

const labelCls = "text-stone-500 text-sm font-medium font-montserrat leading-5";
const errorCls = "text-red-500 text-xs font-montserrat mt-0.5";

function inputCls(hasError: boolean) {
  return `w-full px-5 py-3 h-12 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 text-sm font-medium font-montserrat text-stone-900 placeholder:text-stone-400 ${
    hasError ? "outline-red-400" : "outline-gray-200"
  }`;
}

function selectTriggerCls(hasError: boolean) {
  return `w-full h-auto px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline outline-1 -outline-offset-1 text-sm font-medium font-montserrat text-zinc-800 data-placeholder:text-stone-400 ${
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
  productType: z.string().min(1, "Please select a product type"),
  otherIndustriesServed: z.string().optional(),
  message: z.string().min(10, "Tell us a bit more (at least 10 characters)"),
});

type FormData = z.infer<typeof schema>;

function Field({ label, error, children, className = "", name }: { label: string; error?: string; children: React.ReactNode; className?: string; name?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} data-field={name} tabIndex={name ? -1 : undefined}>
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
  name: "country" | "city" | "businessType" | "industriesServed" | "productType";
  placeholder: string;
  options: string[];
  hasError: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          items={options.map((o) => ({ value: o, label: o }))}
          value={field.value ?? ""}
          onValueChange={(v) => field.onChange(v ?? "")}
        >
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

type SupplierFormSectionProps = {
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
  businessTypeOptions = DEFAULT_BUSINESS_TYPES,
  industryOptions = DEFAULT_INDUSTRIES,
  productTypeOptions = DEFAULT_PRODUCT_TYPES,
}: SupplierFormSectionProps) {
  const [submitError, setSubmitError] = useState<string>();
  const [dialCode, setDialCode] = useState("+91");
  const { getToken } = useRecaptcha();
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedCountry = useWatch({ control, name: "country" });
  const cityOptions = useMemo(() => getCitiesForCountry(selectedCountry ?? ""), [selectedCountry]);

  const onSubmit = async (data: FormData) => {
    setSubmitError(undefined);

    const body = new FormData();
    body.append("source", "supplier");
    body.append("industryName", data.otherIndustriesServed?.trim() || data.industriesServed);
    body.append("fullName", data.fullName);
    body.append("enquiryType", data.businessType);
    body.append("product", data.productType);
    body.append("phone", data.phone);
    body.append("email", data.email);
    body.append("country", data.country);
    body.append("city", data.city);
    body.append("company", data.companyName);
    body.append("message", data.message);
    const recaptchaToken = await getToken("supplier_application");
    if (recaptchaToken) body.append(RECAPTCHA_TOKEN_FIELD, recaptchaToken);

    const res = await fetch("/api/v1/enquiries", { method: "POST", body });
    const json = await res.json();

    if (!json.success) {
      setSubmitError(json.error?.message ?? "Failed to submit your application. Please try again.");
      throw new Error(json.error?.message ?? "Failed to submit supplier application");
    }
  };

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
        <form
          onSubmit={handleSubmit(onSubmit, scrollToFirstFormError)}
          className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-6"
        >
          <HoneypotFields />
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
                <PhoneCodeSelect value={dialCode} onChange={setDialCode} />
                <input
                  {...register("phone")}
                  type="tel"
                  inputMode="numeric"
                  onKeyDown={digitsOnlyKeyDown}
                  placeholder="Enter phone number"
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm font-medium font-montserrat text-stone-900 placeholder:text-stone-400 outline-none"
                />
              </div>
              {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
            </div>

            <Field label="Email" error={errors.email?.message} className="flex-1">
              <input {...register("email")} type="email" placeholder="e.g. abc@gmail.com" className={inputCls(!!errors.email)} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1 flex flex-col gap-2" data-field="country" tabIndex={-1}>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <FilterCombobox
                    label="Country"
                    placeholder="Select Country"
                    options={COUNTRY_NAMES}
                    value={field.value ? [field.value] : []}
                    onChange={(v) => {
                      field.onChange(v[0] ?? "");
                      setValue("city", "");
                    }}
                    multiple={false}
                  />
                )}
              />
              {errors.country && <p className={errorCls}>{errors.country.message}</p>}
            </div>

            <div className="flex-1 flex flex-col gap-2" data-field="city" tabIndex={-1}>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <FilterCombobox
                    label="City"
                    placeholder={selectedCountry ? "Select City" : "Select a country first"}
                    options={cityOptions}
                    value={field.value ? [field.value] : []}
                    onChange={(v) => field.onChange(v[0] ?? "")}
                    multiple={false}
                  />
                )}
              />
              {errors.city && <p className={errorCls}>{errors.city.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Business Type" error={errors.businessType?.message} className="flex-1" name="businessType">
              <FormSelect control={control} name="businessType" placeholder="Business Type" options={businessTypeOptions} hasError={!!errors.businessType} />
            </Field>

            <Field label="Industries Served" error={errors.industriesServed?.message} className="flex-1" name="industriesServed">
              <FormSelect control={control} name="industriesServed" placeholder="Select" options={industryOptions} hasError={!!errors.industriesServed} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Product Type" error={errors.productType?.message} className="flex-1" name="productType">
              <FormSelect control={control} name="productType" placeholder="Select Product Type" options={productTypeOptions} hasError={!!errors.productType} />
            </Field>

            <Field label="Other Industries Served" className="flex-1">
              <input
                {...register("otherIndustriesServed")}
                placeholder="e.g. Energy, Chemicals, Packaging, Textiles"
                className={inputCls(false)}
              />
            </Field>
          </div>

          <Field label="Your Message" error={errors.message?.message}>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Share any additional details about your business or partnership interest..."
              className={`w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 text-sm font-medium font-montserrat text-stone-900 placeholder:text-stone-400 resize-none ${errors.message ? "outline-red-400" : "outline-gray-200"}`}
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
