"use client";
import { useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const POSITIONS = [
  "Quality Assurance Engineer",
  "Design Engineer – Automation Systems",
  "Production Engineer",
  "Sales Engineer – Industrial Solutions",
  "Service & Support Engineer",
];
const EXPERIENCE = ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
const LOCATIONS = ["Vadodara, India", "Mumbai, India", "Bangalore, India", "Delhi, India"];

const BENEFITS = [
  "Work on real, impactful projects",
  "Collaborative and supportive team culture",
  "Opportunities to learn and grow continuously",
  "Exposure to diverse industries and challenges",
  "Space to bring your ideas to life",
  "Transparent and structured work environment",
];

const labelCls = "text-stone-500 text-sm font-medium font-montserrat leading-5";
const inputCls = "w-full px-5 py-3 h-12 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none";
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
    <Select value={value} onValueChange={(v) => onValueChange(v ?? "")}>
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

export function CareerFormSection() {
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>();

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left copy */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-14">
          <div className="flex flex-col gap-2">
            <h2 className="text-neutral-950 text-2xl lg:text-3xl font-medium font-montserrat leading-9 lg:leading-10">
              Start Your Journey With Us
            </h2>
            <p className="max-w-80 text-stone-500 text-base font-medium font-montserrat leading-6">
              Share your details and portfolio, our team will get in touch with you
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-1.5 size-2.5 shrink-0 bg-red-600" />
                <span className="text-zinc-800 text-sm font-medium font-montserrat leading-5">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form card */}
        <form className="flex-1 p-5 lg:p-7 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-6">
          <Field label="Full Name">
            <input name="fullName" placeholder="e.g. John Doe" className={inputCls} />
          </Field>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Email" className="flex-1">
              <input name="email" type="email" placeholder="e.g. abc@yourcompany.com" className={inputCls} />
            </Field>

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
          </div>

          <Field label="Position you are applying for">
            <FormSelect placeholder="Select" options={POSITIONS} value={position} onValueChange={setPosition} />
          </Field>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Years of experience" className="flex-1">
              <FormSelect placeholder="Select" options={EXPERIENCE} value={experience} onValueChange={setExperience} />
            </Field>

            <Field label="Current Location" className="flex-1">
              <FormSelect placeholder="Select" options={LOCATIONS} value={location} onValueChange={setLocation} />
            </Field>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <Field label="Expected Salary" className="flex-1">
              <input name="expectedSalary" placeholder="e.g. 50 LPA" className={inputCls} />
            </Field>

            <Field label="Notice Period" className="flex-1">
              <input name="noticePeriod" placeholder="e.g. 2 months" className={inputCls} />
            </Field>
          </div>

          <Field label="Why do you want to join us?">
            <textarea
              name="message"
              rows={4}
              placeholder="Share your application, specifications, or problem you're trying to solve"
              className="w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none resize-none"
            />
          </Field>

          <div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFileName(e.target.files?.[0]?.name)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-11 px-5 py-2.5 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 flex items-center justify-center gap-1 text-red-600 text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-gray-100 transition-colors"
            >
              {fileName ?? (
                <>
                  Upload Resume <span className="font-normal">(PDF OR DOC, MAX 5MB)</span>
                </>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled
            className="w-full px-6 py-3.5 bg-orange-600 rounded-full text-white text-sm font-semibold font-montserrat uppercase leading-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit all details
          </button>
        </form>
      </div>
    </section>
  );
}
