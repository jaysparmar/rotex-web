"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterCombobox } from "@/components/ui/filter-combobox";
import { IndustryTreeCombobox, type IndustryOptionGroup } from "@/components/ui/industry-tree-combobox";
import { HoneypotFields } from "@/components/ui/honeypot-fields";
import { PhoneCodeSelect } from "@/components/ui/phone-code-select";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { RECAPTCHA_TOKEN_FIELD } from "@/lib/spam-protection-fields";
import { COUNTRY_NAMES, getCitiesForCountry } from "@/lib/world-countries";
import { digitsOnlyKeyDown, scrollToFirstFormError } from "@/lib/utils";
import {
  DEFAULT_PRODUCT_TYPE_CONFIG,
  ENQUIRY_TYPE_OPTIONS_BY_FORM,
  type FormFieldKey,
  type FormKey,
} from "@/lib/form-config-shared";

// Every common-form submission maps onto the one generic Enquiry API — this is
// the only thing distinguishing a form's purpose, since the shared fields and
// the single POST route cover all five.
const ENQUIRY_TYPE_BY_FORM: Record<FormKey, string> = {
  contact: "General Enquiry",
  industry: "General Enquiry",
  "product-quote": "enquiry",
  supplier: "Supplier Application",
  "channel-partner": "Channel Partner Application",
};

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

function Field({
  label,
  error,
  children,
  className = "",
  name,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  name?: string;
}) {
  return (
    <div className={`min-w-0 flex flex-col gap-2 ${className}`} data-field={name} tabIndex={name ? -1 : undefined}>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

/** Renders visible children side-by-side once there's room; collapses to one column if only one
 * is present or if the form's own rendered width is cramped (a container query, not a viewport
 * breakpoint — this form sits in a narrow sidebar column on some pages even at desktop widths,
 * so `lg:` alone would force two squeezed columns there). */
function Row({ children }: { children: React.ReactNode }) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  if (items.length === 0) return null;
  return <div className="flex flex-col gap-5 @min-[480px]:flex-row">{items}</div>;
}

function buildSchema(enabled: Record<FormFieldKey, boolean>, showEnquiryType: boolean, formKey: FormKey) {
  // Contact form only: split name, add Designation, require Company Name and
  // (if shown) Quantity, and gate submission on the Privacy Policy consent
  // checkbox when the admin has it enabled. Every other form keeps the
  // original single Full Name field and optional Company Name/Quantity.
  const isContact = formKey === "contact";
  return z.object({
    fullName: isContact ? z.string().optional() : z.string().min(2, "Name must be at least 2 characters"),
    firstName: isContact && enabled.firstName ? z.string().min(1, "First name is required") : z.string().optional(),
    lastName: isContact && enabled.lastName ? z.string().min(1, "Last name is required") : z.string().optional(),
    designation: isContact && enabled.designation ? z.string().min(1, "Designation is required") : z.string().optional(),
    companyName: isContact ? z.string().min(1, "Company name is required") : z.string().optional(),
    phone: z.string().min(10, "Enter a valid 10-digit number").max(15, "Phone number is too long").regex(/^\d+$/, "Digits only"),
    email: z.string().email("Enter a valid email address"),
    country: enabled.country ? z.string().min(1, "Please select a country") : z.string().optional(),
    city: enabled.city ? z.string().min(1, "Please select a city") : z.string().optional(),
    industry: enabled.industry ? z.array(z.string()).min(1, "Please select at least one industry") : z.array(z.string()).optional(),
    enquiryType: showEnquiryType ? z.string().min(1, "Please select an enquiry type") : z.string().optional(),
    productType: enabled.productType ? z.string().min(1, "Please select a product type") : z.string().optional(),
    quantity: isContact && enabled.quantity ? z.string().min(1, "Quantity is required") : z.string().optional(),
    message: z.string().min(10, "Tell us a bit more (at least 10 characters)"),
    consent:
      isContact && enabled.consent
        ? z.boolean().refine((v) => v === true, { message: "Please accept the Privacy Policy to continue" })
        : z.boolean().optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export type CommonEnquiryFieldsProps = {
  formKey: FormKey;
  config: Record<FormFieldKey, boolean>;
  /** Tree of allowed industries/sub-industries for the "Industry Served" select, grouped by
   * parent — only what the admin picked for this form. */
  industryOptions?: IndustryOptionGroup[];
  /** Page already determines the industry (e.g. an industry's own enquiry form) — skips
   * rendering the field and sends this value regardless of the config toggle. */
  fixedIndustryName?: string;
  /** Page already determines the product (e.g. a single product's quote form) — skips
   * rendering the "Product Type" field and sends this value regardless of the toggle. */
  fixedProduct?: string;
  /** Admin-ordered Enquiry Type options for this form; falls back to the fixed default order. */
  enquiryTypeOptions?: readonly string[];
  /** Admin-ordered, admin-labeled Product Type options; falls back to the fixed defaults. */
  productTypeOptions?: readonly { key: string; label: string }[];
  recaptchaAction: string;
  submitLabel?: string;
  sendingLabel?: string;
  successMessage?: string;
};

export function CommonEnquiryFields({
  formKey,
  config,
  industryOptions = [],
  fixedIndustryName,
  fixedProduct,
  enquiryTypeOptions: enquiryTypeOptionsProp,
  productTypeOptions: productTypeOptionsProp,
  recaptchaAction,
  submitLabel = "Submit all details",
  sendingLabel = "Submitting…",
  successMessage = "Submitted! We'll be in touch soon.",
}: CommonEnquiryFieldsProps) {
  const [submitError, setSubmitError] = useState<string>();
  const [dialCode, setDialCode] = useState("+91");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { getToken } = useRecaptcha();

  const showIndustry = config.industry && !fixedIndustryName;
  const showProductType = config.productType && !fixedProduct;
  const enquiryTypeOptions = enquiryTypeOptionsProp ?? ENQUIRY_TYPE_OPTIONS_BY_FORM[formKey] ?? [];
  const showEnquiryType = config.enquiryType && enquiryTypeOptions.length > 0;
  const productTypeOptions = productTypeOptionsProp ?? DEFAULT_PRODUCT_TYPE_CONFIG;

  const isContact = formKey === "contact";
  const showFirstName = isContact && config.firstName;
  const showLastName = isContact && config.lastName;
  const showDesignation = isContact && config.designation;
  const showConsent = isContact && config.consent;
  const schema = useMemo(() => buildSchema(config, showEnquiryType, formKey), [config, showEnquiryType, formKey]);
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const selectedCountry = useWatch({ control, name: "country" });
  const cityOptions = useMemo(() => getCitiesForCountry(selectedCountry ?? ""), [selectedCountry]);
  const industryValue = useWatch({ control, name: "industry" }) as string[] | undefined;

  const onSubmit = async (data: FormValues) => {
    setSubmitError(undefined);

    const body = new FormData();
    body.append("source", formKey);
    body.append("industryName", fixedIndustryName || data.industry?.join(", ") || "General");
    body.append(
      "fullName",
      isContact ? [data.firstName, data.lastName].filter(Boolean).join(" ") : data.fullName ?? ""
    );
    if (isContact && data.designation) body.append("designation", data.designation);
    body.append("enquiryType", (showEnquiryType && data.enquiryType) || ENQUIRY_TYPE_BY_FORM[formKey]);
    body.append("product", fixedProduct || data.productType || "General");
    body.append("phone", data.phone);
    body.append("email", data.email);
    body.append("country", (config.country && data.country) || "N/A");
    body.append("city", (config.city && data.city) || "N/A");
    if (config.companyName && data.companyName) body.append("company", data.companyName);
    if (config.quantity && data.quantity) body.append("quantity", data.quantity);
    body.append("message", data.message);
    if (config.uploadFile) for (const file of files) body.append("file", file);

    const recaptchaToken = await getToken(recaptchaAction);
    if (recaptchaToken) body.append(RECAPTCHA_TOKEN_FIELD, recaptchaToken);

    const res = await fetch("/api/v1/enquiries", { method: "POST", body });
    const json = await res.json();

    if (!json.success) {
      setSubmitError(json.error?.message ?? "Failed to submit. Please try again.");
      throw new Error(json.error?.message ?? "Failed to submit enquiry");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, scrollToFirstFormError)} className="@container flex flex-col gap-6">
      <HoneypotFields />

      {isContact ? (
        <Row>
          {showFirstName && (
            <Field key="firstName" label="First Name" error={errors.firstName?.message} className="flex-1">
              <input {...register("firstName")} placeholder="e.g. John" className={inputCls(!!errors.firstName)} />
            </Field>
          )}
          {showLastName && (
            <Field key="lastName" label="Last Name" error={errors.lastName?.message} className="flex-1">
              <input {...register("lastName")} placeholder="e.g. Doe" className={inputCls(!!errors.lastName)} />
            </Field>
          )}
        </Row>
      ) : (
        <Field label="Full Name" error={errors.fullName?.message}>
          <input {...register("fullName")} placeholder="e.g. John Doe" className={inputCls(!!errors.fullName)} />
        </Field>
      )}

      {showDesignation && (
        <Field label="Designation" error={errors.designation?.message}>
          <input {...register("designation")} placeholder="e.g. Procurement Manager" className={inputCls(!!errors.designation)} />
        </Field>
      )}

      {config.companyName && (
        <Field label="Company Name" error={errors.companyName?.message}>
          <input {...register("companyName")} placeholder="e.g. Rotex Automation" className={inputCls(!!errors.companyName)} />
        </Field>
      )}

      <Row>
        <div key="phone" className="min-w-0 flex-1 flex flex-col gap-2">
          <label className={labelCls}>Phone number</label>
          <div
            className={`flex bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 overflow-hidden ${
              errors.phone ? "outline-red-400" : "outline-gray-200"
            }`}
          >
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

        <Field key="email" label="Email" error={errors.email?.message} className="flex-1">
          <input {...register("email")} type="email" placeholder="e.g. john@yourcompany.com" className={inputCls(!!errors.email)} />
        </Field>
      </Row>

      <Row>
        {config.country && (
          <div key="country" className="min-w-0 flex-1 flex flex-col gap-2" data-field="country" tabIndex={-1}>
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
        )}

        {config.city &&
          (config.country ? (
            <div key="city" className="min-w-0 flex-1 flex flex-col gap-2" data-field="city" tabIndex={-1}>
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
          ) : (
            <Field key="city" label="City" error={errors.city?.message} className="flex-1">
              <input {...register("city")} placeholder="e.g. Vadodara" className={inputCls(!!errors.city)} />
            </Field>
          ))}
      </Row>

      <Row>
        {showIndustry && (
          <div key="industry" className="min-w-0 flex-1 flex flex-col gap-2" data-field="industry" tabIndex={-1}>
            {industryOptions.length > 0 ? (
              <Controller
                control={control}
                name="industry"
                render={({ field }) => (
                  <IndustryTreeCombobox
                    label="Industry Served"
                    placeholder="Select Industry"
                    groups={industryOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
            ) : (
              <Field label="Industry Served" error={errors.industry?.message}>
                <input
                  value={industryValue?.[0] ?? ""}
                  onChange={(e) => setValue("industry", e.target.value ? [e.target.value] : [])}
                  placeholder="e.g. Automotive"
                  className={inputCls(!!errors.industry)}
                />
              </Field>
            )}
            {errors.industry && <p className={errorCls}>{errors.industry.message}</p>}
          </div>
        )}

        {showProductType && (
          <Field key="productType" label="Product Type" error={errors.productType?.message} className="flex-1" name="productType">
            <FormSelect
              control={control}
              name="productType"
              placeholder="Select Product Type"
              options={productTypeOptions.map((o) => o.label)}
              hasError={!!errors.productType}
            />
          </Field>
        )}
      </Row>

      {showEnquiryType && (
        <Field label="Enquiry Type" error={errors.enquiryType?.message} name="enquiryType">
          <FormSelect
            control={control}
            name="enquiryType"
            placeholder="Select Enquiry Type"
            options={[...enquiryTypeOptions]}
            hasError={!!errors.enquiryType}
          />
        </Field>
      )}

      {config.quantity && (
        <Field label="Quantity">
          <input {...register("quantity")} placeholder="e.g. 500" className={inputCls(false)} />
        </Field>
      )}

      <Field label="Message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={4}
          placeholder="Share your application, specifications, or problem you're trying to solve"
          className={`w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 text-sm font-medium font-montserrat text-stone-900 placeholder:text-stone-400 resize-none ${
            errors.message ? "outline-red-400" : "outline-gray-200"
          }`}
        />
      </Field>

      {config.uploadFile && (
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full min-h-11 px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 flex items-center justify-center text-[#EF3E23] text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-gray-100 transition-colors"
          >
            {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Upload Files"}
          </button>
          {files.length > 0 && (
            <ul className="flex flex-col gap-1">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 text-sm text-stone-600">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="shrink-0 text-stone-400 hover:text-[#EF3E23] transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showConsent && (
        <div className="flex flex-col gap-1.5" data-field="consent" tabIndex={-1}>
          <label className="flex items-start gap-2.5 text-sm font-medium font-montserrat text-stone-600">
            <input
              type="checkbox"
              {...register("consent")}
              className={`mt-0.5 size-4 shrink-0 rounded border-gray-300 accent-[#EF3E23] ${
                errors.consent ? "outline outline-1 outline-red-400" : ""
              }`}
            />
            <span>
              I have read and agree to the{" "}
              <Link href="/privacy-policy" target="_blank" className="text-[#EF3E23] underline hover:no-underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.consent && <p className={errorCls}>{errors.consent.message}</p>}
        </div>
      )}

      {submitError && <p className="text-sm font-medium font-montserrat text-red-600">{submitError}</p>}

      {isSubmitSuccessful ? (
        <p className="text-sm font-medium font-montserrat text-green-600">{successMessage}</p>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full px-6 py-3.5 bg-orange-600 rounded-full text-white text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-stone-900 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? sendingLabel : submitLabel}
        </button>
      )}
    </form>
  );
}

function FormSelect({
  control,
  name,
  placeholder,
  options,
  hasError,
}: {
  control: Control<FormValues>;
  name: "productType" | "enquiryType";
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
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
