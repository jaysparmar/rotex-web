"use client";
import { useRef, useState } from "react";
import { digitsOnlyKeyDown } from "@/lib/utils";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HexIcon } from "@/components/ui/hex-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterCombobox } from "@/components/ui/filter-combobox";
import { COUNTRY_NAMES } from "@/lib/world-countries";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  enquiryType: z.string().min(1, "Please select an enquiry type"),
  product: z.string().min(1, "Please select a product"),
  phone: z
    .string()
    .min(10, "Enter a valid 10-digit number")
    .max(15, "Phone number is too long")
    .regex(/^\d+$/, "Digits only"),
  email: z.string().email("Enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(1, "Please enter your city"),
  company: z.string().optional(),
  designation: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const ENQUIRY_TYPES = ["General Enquiry", "Product Support", "Technical Query", "Partnership"];
const PRODUCTS = ["Solenoid Valve", "Angle Seat Valve", "Actuators", "Positioners"];

// ── Component ─────────────────────────────────────────────────────────────────

export function IndustryEnquiryForm({ industryName }: { industryName: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState<string>();
  const [fileName, setFileName] = useState<string>();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(undefined);

    const body = new FormData();
    body.append("source", "industry");
    body.append("industryName", industryName);
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) body.append(key, value);
    }
    const file = fileRef.current?.files?.[0];
    if (file) body.append("file", file);

    const res = await fetch("/api/v1/enquiries", { method: "POST", body });
    const json = await res.json();

    if (!json.success) {
      setSubmitError(json.error?.message ?? "Failed to send enquiry. Please try again.");
      throw new Error(json.error?.message ?? "Failed to submit enquiry");
    }
  };

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
                {/* 24px box holding a 12px glyph, so the mark tops out with the copy */}
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-5 lg:gap-6"
        >
          <Field label="Full Name" error={errors.fullName?.message}>
            <input {...register("fullName")} placeholder="e.g. John Doe" className={inputCls(!!errors.fullName)} />
          </Field>

          <Field label="Enquiry Type" error={errors.enquiryType?.message}>
            <FormSelect
              control={control}
              name="enquiryType"
              placeholder="Enquiry Type"
              options={ENQUIRY_TYPES}
              hasError={!!errors.enquiryType}
            />
          </Field>

          <Field label="Product" error={errors.product?.message}>
            <FormSelect
              control={control}
              name="product"
              placeholder="Select Product"
              options={PRODUCTS}
              hasError={!!errors.product}
            />
          </Field>

          {/* Phone — full width on mobile, half on desktop (side by side with Email) */}
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1 flex flex-col gap-2">
              <label className={labelCls}>Phone number</label>
              <div className={`flex h-11 bg-gray-50 rounded-lg outline outline-1 -outline-offset-1 overflow-hidden ${errors.phone ? "outline-red-400" : "outline-gray-200"}`}>
                <div className="px-3 border-r border-gray-200 flex items-center gap-2 shrink-0">
                  <span className="text-stone-900 text-sm font-medium font-montserrat leading-5">+91</span>
                  <ChevronDown />
                </div>
                <input
                  {...register("phone")}
                  type="tel"
                  inputMode="numeric"
                  onKeyDown={digitsOnlyKeyDown}
                  placeholder="Enter phone number"
                  className={`flex-1 px-3 bg-transparent ${placeholderCls} text-stone-900 outline-none`}
                />
              </div>
              {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
            </div>

            <Field label="Email" error={errors.email?.message} className="flex-1">
              <input {...register("email")} type="email" placeholder="e.g. email@company.com" className={inputCls(!!errors.email)} />
            </Field>
          </div>

          {/* Country + City */}
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1 flex flex-col gap-2">
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <FilterCombobox
                    label="Country"
                    placeholder="Select Country"
                    options={COUNTRY_NAMES}
                    value={field.value ? [field.value] : []}
                    onChange={(v) => field.onChange(v[0] ?? "")}
                    multiple={false}
                  />
                )}
              />
              {errors.country && <p className={errorCls}>{errors.country.message}</p>}
            </div>

            <Field label="City" error={errors.city?.message} className="flex-1">
              <input {...register("city")} placeholder="Select City" className={inputCls(!!errors.city)} />
            </Field>
          </div>

          {/* Company + Designation */}
          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Company" className="flex-1">
              <input {...register("company")} placeholder="e.g. Rotex Automation" className={inputCls(false)} />
            </Field>
            <Field label="Designation" className="flex-1">
              <input {...register("designation")} placeholder="e.g. Sales Manager" className={inputCls(false)} />
            </Field>
          </div>

          <Field label="Your Message" error={errors.message?.message}>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Your Message"
              className={`w-full px-3 py-2.5 bg-gray-50 rounded-lg outline outline-1 -outline-offset-1 ${placeholderCls} text-stone-900 resize-none ${errors.message ? "outline-red-400" : "outline-gray-200"}`}
            />
          </Field>

          {/* File upload */}
          <div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => setFileName(e.target.files?.[0]?.name)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-11 px-5 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 flex items-center justify-center gap-2 text-[#EF3E23] text-xs font-semibold font-montserrat uppercase leading-5 hover:bg-gray-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 4l3-3 3 3M1 10v1.5A1.5 1.5 0 002.5 13h9A1.5 1.5 0 0013 11.5V10" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {fileName ?? "Upload File"}
            </button>
          </div>

          {submitError && (
            <p className="text-sm font-medium font-montserrat text-red-600">{submitError}</p>
          )}

          {isSubmitSuccessful ? (
            <p className="text-sm font-medium font-montserrat text-green-600">
              Enquiry sent! We&apos;ll be in touch soon.
            </p>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-stone-900 rounded-full text-white text-sm font-semibold font-montserrat uppercase leading-5 whitespace-nowrap hover:bg-primary transition-colors duration-150 disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send Enquiry"}
            </button>
          )}
        </form>

      </div>
    </section>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const labelCls = "text-stone-500 text-sm font-medium font-montserrat leading-5";
const errorCls = "text-red-500 text-xs font-montserrat mt-0.5";
// stone-400 (#a8a29e), not neutral-400 — the theme overrides neutral-400 to a dark #4a5565
const placeholderCls = "text-sm font-medium font-montserrat leading-5 placeholder:text-stone-400";

function inputCls(hasError: boolean) {
  return `w-full h-11 px-3 bg-gray-50 rounded-lg outline outline-1 -outline-offset-1 ${placeholderCls} text-stone-900 ${hasError ? "outline-red-400" : "outline-gray-200"}`;
}

function Field({
  label, error, children, className = "",
}: {
  label: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

/*
  The shared custom Select (same component the Awards filter and admin forms use)
  instead of a native <select>, so the popup is styled consistently. Bridged into
  react-hook-form with Controller since it isn't a native input.
*/
function FormSelect({
  control,
  name,
  placeholder,
  options,
  hasError,
}: {
  control: Control<FormData>;
  name: "enquiryType" | "product" | "country";
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
          <SelectTrigger
            className={`w-full h-11 px-3 bg-gray-50 rounded-lg border-0 outline outline-1 -outline-offset-1 text-sm font-medium font-montserrat leading-5 text-stone-900 data-placeholder:text-stone-400 ${
              hasError ? "outline-red-400" : "outline-gray-200"
            }`}
          >
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

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4L6 8L10 4" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
