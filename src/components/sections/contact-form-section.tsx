"use client";
import { useState } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageView } from "@/components/ui/image-view";
import partner1 from "@/assets/Images/trustPartners/img_1.png";
import partner2 from "@/assets/Images/trustPartners/img_2.png";
import partner3 from "@/assets/Images/trustPartners/img_3.png";
import partner4 from "@/assets/Images/trustPartners/img_4.png";
import partner5 from "@/assets/Images/trustPartners/img_5.png";
import partner6 from "@/assets/Images/trustPartners/img_6.png";
import {
  ENQUIRY_TYPE_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  CITY_OPTIONS,
  INDUSTRY_OPTIONS,
} from "@/lib/contact-data";

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

const defaultLogos = [partner1, partner2, partner3, partner4, partner5, partner6].map((src, i) => ({
  id: String(i),
  src,
  alt: "Partner",
}));

type Logo = { id: string; src: string | import("next/image").StaticImageData; alt: string };

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
  company: z.string().optional(),
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(1, "Please select a city"),
  industryName: z.string().min(1, "Please select an industry"),
  message: z.string().min(10, "Message must be at least 10 characters"),
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
  name: "enquiryType" | "product" | "country" | "city" | "industryName";
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

type ContactFormSectionProps = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  certificationsLabel?: string;
  certificationsText?: string;
  trustLabel?: string;
  logos?: Logo[];
  enquiryTypeOptions?: string[];
  productTypeOptions?: string[];
  countryOptions?: string[];
  cityOptions?: string[];
  industryOptions?: string[];
  defaultCountry?: string;
};

export function ContactFormSection({
  eyebrow = "About Rotex",
  heading = "A Global Fluid Control Specialist",
  description = "With a presence across 30+ countries, we partner with leading OEMs, EPCs, and system integrators to deliver cutting-edge automation solutions. Our expertise spans control valves, actuators, and complete automation systems designed for mission-critical applications.",
  certificationsLabel = "Standards & Certifications",
  certificationsText = "ATEX, IECEx, PESO, CE, SIL 2 / SIL 3, PED, ISI / BIS, INMETRO, UL",
  trustLabel = "Trusted by industry leaders",
  logos = defaultLogos,
  enquiryTypeOptions = ENQUIRY_TYPE_OPTIONS,
  productTypeOptions = PRODUCT_TYPE_OPTIONS,
  countryOptions = COUNTRY_OPTIONS,
  cityOptions = CITY_OPTIONS,
  industryOptions = INDUSTRY_OPTIONS,
  defaultCountry = "United States",
}: ContactFormSectionProps) {
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
    body.append("source", "contact");
    body.append("industryName", data.industryName);
    body.append("fullName", data.fullName);
    body.append("enquiryType", data.enquiryType);
    body.append("product", data.product);
    body.append("phone", data.phone);
    body.append("email", data.email);
    body.append("country", data.country);
    body.append("city", data.city);
    body.append("message", data.message);
    if (data.company) body.append("company", data.company);

    const res = await fetch("/api/v1/enquiries", { method: "POST", body });
    const json = await res.json();

    if (!json.success) {
      setSubmitError(json.error?.message ?? "Failed to send your message. Please try again.");
      throw new Error(json.error?.message ?? "Failed to submit contact form");
    }
  };

  return (
    <section id="contact-form" className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-16">
        {/* Left: About Rotex */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-14">
          <div className="flex flex-col gap-3">
            <span className="text-red-600 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide">{eyebrow}</span>
            <h2 className="text-neutral-950 text-3xl font-medium font-montserrat leading-10">{heading}</h2>
            <p className="text-stone-500 text-base font-medium font-montserrat leading-6">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide whitespace-nowrap">
                {certificationsLabel}
              </span>
              <div className="flex-1 h-px bg-black/10" />
            </div>
            <p className="text-stone-900 text-base font-medium font-montserrat leading-6">
              {certificationsText}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide whitespace-nowrap">
                {trustLabel}
              </span>
              <div className="flex-1 h-px bg-black/10" />
            </div>
            <div className="flex flex-wrap items-center gap-8">
              {logos.map((logo) => (
                <ImageView
                  key={logo.id}
                  src={logo.src}
                  alt={logo.alt}
                  width={90}
                  height={40}
                  className="object-contain h-8 w-auto"
                  unoptimized={typeof logo.src === "string"}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-6"
        >
          <Field label="Full Name" error={errors.fullName?.message}>
            <input {...register("fullName")} placeholder="e.g. John Doe" className={inputCls(!!errors.fullName)} />
          </Field>

          <Field label="Enquiry type" error={errors.enquiryType?.message}>
            <FormSelect control={control} name="enquiryType" placeholder="Select Enquiry Type" options={enquiryTypeOptions} hasError={!!errors.enquiryType} />
          </Field>

          <Field label="Product type" error={errors.product?.message}>
            <FormSelect control={control} name="product" placeholder="Select Product Type" options={productTypeOptions} hasError={!!errors.product} />
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

            <Field label="Business Email" error={errors.email?.message} className="flex-1">
              <input {...register("email")} type="email" placeholder="e.g. John@Rotexautomation.com" className={inputCls(!!errors.email)} />
            </Field>
          </div>

          <Field label="Company Name">
            <input {...register("company")} placeholder="e.g. Rotex Automation" className={inputCls(false)} />
          </Field>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Country" error={errors.country?.message} className="flex-1">
              <FormSelect control={control} name="country" placeholder="Select Country" options={countryOptions} hasError={!!errors.country} />
            </Field>

            <Field label="City" error={errors.city?.message} className="flex-1">
              <FormSelect control={control} name="city" placeholder="Select City" options={cityOptions} hasError={!!errors.city} />
            </Field>
          </div>

          <Field label="Industry" error={errors.industryName?.message}>
            <FormSelect control={control} name="industryName" placeholder="Select Industry" options={industryOptions} hasError={!!errors.industryName} />
          </Field>

          <Field label="Your Message" error={errors.message?.message}>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Share your application, specifications, or problem you're trying to solve"
              className={`w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none resize-none ${errors.message ? "outline-red-400" : "outline-gray-200"}`}
            />
          </Field>

          {submitError && <p className="text-sm font-medium font-montserrat text-red-600">{submitError}</p>}

          {isSubmitSuccessful ? (
            <p className="text-sm font-medium font-montserrat text-green-600">
              Message sent! We&apos;ll be in touch soon.
            </p>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-orange-600 rounded-full text-white text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-stone-900 transition-colors duration-150 disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Submit all details"}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
