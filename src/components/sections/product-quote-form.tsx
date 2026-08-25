"use client";
import { useState } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  company: z.string().optional(),
  phone: z
    .string()
    .min(10, "Enter a valid 10-digit number")
    .max(15, "Phone number is too long")
    .regex(/^\d+$/, "Digits only"),
  email: z.string().email("Enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(1, "Please enter your city"),
  quantity: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;
type RequestType = "datasheet" | "enquiry";

const COUNTRIES = ["United States", "India", "UAE", "Saudi Arabia", "United Kingdom", "Germany"];

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductQuoteForm({
  productCode,
  productName,
  industries,
}: {
  productCode: string;
  productName: string;
  industries: string[];
}) {
  const [submitError, setSubmitError] = useState<string>();
  const [requestType, setRequestType] = useState<RequestType>("enquiry");

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
    body.append("source", "product-quote");
    body.append("requestType", requestType);
    body.append("productCode", productCode);
    body.append("productName", productName);
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) body.append(key, value);
    }

    const res = await fetch("/api/v1/enquiries", { method: "POST", body });
    const json = await res.json();

    if (!json.success) {
      setSubmitError(json.error?.message ?? "Failed to send enquiry. Please try again.");
      throw new Error(json.error?.message ?? "Failed to submit enquiry");
    }
  };

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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full lg:max-w-158 p-5 lg:p-7 bg-white rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-6"
        >
          <Field label="Full Name" error={errors.fullName?.message}>
            <input {...register("fullName")} placeholder="e.g. John Doe" className={inputCls(!!errors.fullName)} />
          </Field>

          <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
            <Field label="Industry" error={errors.industry?.message} className="flex-1">
              <FormSelect
                control={control}
                name="industry"
                placeholder="Select"
                options={industries}
                hasError={!!errors.industry}
              />
            </Field>
            <Field label="Company" className="flex-1">
              <input {...register("company")} placeholder="e.g. Rotex automation" className={inputCls(false)} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1 flex flex-col gap-2">
              <label className={labelCls}>Phone number</label>
              <div className={`flex h-12 bg-gray-50 rounded-xl shadow-[0px_0px_0px_2px_rgba(0,0,0,0.05)] outline outline-1 -outline-offset-1 overflow-hidden ${errors.phone ? "outline-red-400" : "outline-gray-200"}`}>
                <div className="px-3 border-r border-gray-200 flex items-center gap-2 shrink-0">
                  <span className="text-stone-900 text-sm font-medium font-montserrat leading-5">+91</span>
                  <ChevronDown />
                </div>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="Enter phone number"
                  className={`flex-1 px-4 bg-transparent ${placeholderCls} text-stone-900 outline-none`}
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
              <FormSelect
                control={control}
                name="country"
                placeholder="Select"
                options={COUNTRIES}
                hasError={!!errors.country}
              />
            </Field>
            <Field label="City" error={errors.city?.message} className="flex-1">
              <input {...register("city")} placeholder="Select City" className={selectLikeCls(!!errors.city)} />
            </Field>
          </div>

          <Field label="Quantity Requirement">
            <input {...register("quantity")} placeholder="e.g 500" className={inputCls(false)} />
          </Field>

          <Field label="Inquiry Details" error={errors.message?.message}>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Outline your application requirements and specifications..."
              className={`w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 ${placeholderCls} text-stone-900 outline-none resize-none ${errors.message ? "outline-red-400" : "outline-gray-200"}`}
            />
          </Field>

          {submitError && <p className="text-sm font-medium font-montserrat text-red-600">{submitError}</p>}

          {isSubmitSuccessful ? (
            <p className="text-sm font-medium font-montserrat text-green-600">
              Enquiry sent! We&apos;ll be in touch soon.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => setRequestType("datasheet")}
                className="w-56 px-6 py-3.5 bg-stone-900 rounded-full flex justify-center items-center gap-5 text-white text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-stone-800 transition-colors disabled:opacity-60"
              >
                Email me a Datasheet
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => setRequestType("enquiry")}
                className="px-6 py-3.5 bg-orange-600 rounded-full flex justify-center items-center gap-5 text-white text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-orange-700 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Send Enquiry"}
              </button>
            </div>
          )}
        </form>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const labelCls = "text-stone-500 text-sm font-medium font-montserrat leading-5";
const errorCls = "text-red-500 text-xs font-montserrat mt-0.5";
const placeholderCls = "text-base font-medium font-montserrat leading-6 placeholder:text-neutral-400";

function inputCls(hasError: boolean) {
  return `w-full h-12 px-5 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 ${placeholderCls} text-stone-900 outline-none ${hasError ? "outline-red-400" : "outline-gray-200"}`;
}

function selectLikeCls(hasError: boolean) {
  return `w-full px-3 py-2.5 bg-gray-50 rounded-lg outline outline-1 -outline-offset-1 text-base font-medium font-montserrat leading-6 placeholder:text-neutral-400 text-stone-900 outline-none ${hasError ? "outline-red-400" : "outline-gray-200"}`;
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

function FormSelect({
  control,
  name,
  placeholder,
  options,
  hasError,
}: {
  control: Control<FormData>;
  name: "industry" | "country";
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
            className={`w-full px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline outline-1 -outline-offset-1 text-base font-medium font-montserrat leading-6 text-stone-900 data-placeholder:text-neutral-400 ${
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
