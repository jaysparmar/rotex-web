"use client";
import { useState } from "react";
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
const inputCls =
  "w-full px-5 py-3 h-12 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none";
const selectTriggerCls =
  "w-full h-auto px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-zinc-800 data-placeholder:text-neutral-400";

const trustLogos = [partner1, partner2, partner3, partner4, partner5, partner6];

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
    <Select value={value} onValueChange={(v) => onValueChange(v ?? "")}>
      <SelectTrigger className={selectTriggerCls}>
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
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4L6 8L10 4" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ContactFormSection() {
  const [enquiryType, setEnquiryType] = useState("");
  const [productType, setProductType] = useState("");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");

  return (
    <section id="contact-form" className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-16">
        {/* Left: About Rotex */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-14">
          <div className="flex flex-col gap-3">
            <span className="text-red-600 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide">About Rotex</span>
            <h2 className="text-neutral-950 text-3xl font-medium font-montserrat leading-10">A Global Fluid Control Specialist</h2>
            <p className="text-stone-500 text-base font-medium font-montserrat leading-6">
              With a presence across 30+ countries, we partner with leading OEMs, EPCs, and system integrators to deliver
              cutting-edge automation solutions. Our expertise spans control valves, actuators, and complete automation
              systems designed for mission-critical applications.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide whitespace-nowrap">
                Standards &amp; Certifications
              </span>
              <div className="flex-1 h-px bg-black/10" />
            </div>
            <p className="text-stone-900 text-base font-medium font-montserrat leading-6">
              ATEX, IECEx, PESO, CE, SIL 2 / SIL 3, PED, ISI / BIS, INMETRO, UL
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide whitespace-nowrap">
                Trusted by industry leaders
              </span>
              <div className="flex-1 h-px bg-black/10" />
            </div>
            <div className="flex flex-wrap items-center gap-8">
              {trustLogos.map((logo, i) => (
                <ImageView key={i} src={logo} alt="Partner" width={90} height={40} className="object-contain h-8 w-auto" />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form card */}
        <form className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-6">
          <Field label="Full Name">
            <input name="fullName" placeholder="e.g. John Doe" className={inputCls} />
          </Field>

          <Field label="Enquiry type">
            <FormSelect placeholder="Select Enquiry Type" options={ENQUIRY_TYPE_OPTIONS} value={enquiryType} onValueChange={setEnquiryType} />
          </Field>

          <Field label="Product type">
            <FormSelect placeholder="Select Product Type" options={PRODUCT_TYPE_OPTIONS} value={productType} onValueChange={setProductType} />
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

            <Field label="Business Email" className="flex-1">
              <input name="email" type="email" placeholder="e.g. John@Rotexautomation.com" className={inputCls} />
            </Field>
          </div>

          <Field label="Company Name">
            <input name="companyName" placeholder="e.g. Rotex Automation" className={inputCls} />
          </Field>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Country" className="flex-1">
              <FormSelect placeholder="Select Country" options={COUNTRY_OPTIONS} value={country} onValueChange={setCountry} />
            </Field>

            <Field label="City" className="flex-1">
              <FormSelect placeholder="Select City" options={CITY_OPTIONS} value={city} onValueChange={setCity} />
            </Field>
          </div>

          <Field label="Industry">
            <FormSelect placeholder="Select Industry" options={INDUSTRY_OPTIONS} value={industry} onValueChange={setIndustry} />
          </Field>

          <Field label="Your Message">
            <textarea
              name="message"
              rows={4}
              placeholder="Share your application, specifications, or problem you're trying to solve"
              className="w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none resize-none"
            />
          </Field>

          <button
            type="submit"
            className="w-full px-6 py-3.5 bg-orange-600 rounded-full text-white text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-stone-900 transition-colors duration-150"
          >
            Submit all details
          </button>
        </form>
      </div>
    </section>
  );
}
