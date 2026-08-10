"use client";
import { useRef, useState } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_EXPERIENCE = ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

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
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid 10-digit number").max(15).regex(/^\d+$/, "Digits only"),
  position: z.string().min(1, "Please select a position"),
  experience: z.string().min(1, "Please select your experience"),
  location: z.string().min(1, "Please select your location"),
  expectedSalary: z.string().optional(),
  noticePeriod: z.string().optional(),
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
  name: "position" | "experience";
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

type JobApplicationFormProps = {
  experienceOptions?: string[];
  positionOptions?: string[];
  defaultPosition?: string;
  className?: string;
};

export function JobApplicationForm({
  experienceOptions = DEFAULT_EXPERIENCE,
  positionOptions = [],
  defaultPosition,
  className = "",
}: JobApplicationFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { position: defaultPosition ?? "" } });

  const onSubmit = async (data: FormData) => {
    setSubmitError(undefined);

    const body = new FormData();
    body.append("fullName", data.fullName);
    body.append("email", data.email);
    body.append("phone", data.phone);
    body.append("position", data.position);
    body.append("experience", data.experience);
    body.append("location", data.location);
    body.append("message", data.message);
    if (data.expectedSalary) body.append("expectedSalary", data.expectedSalary);
    if (data.noticePeriod) body.append("noticePeriod", data.noticePeriod);
    const file = fileRef.current?.files?.[0];
    if (file) body.append("resume", file);

    const res = await fetch("/api/v1/job-applications", { method: "POST", body });
    const json = await res.json();

    if (!json.success) {
      setSubmitError(json.error?.message ?? "Failed to submit application. Please try again.");
      throw new Error(json.error?.message ?? "Failed to submit application");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-6 rounded-2xl bg-white p-5 outline outline-1 -outline-offset-1 outline-neutral-200 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] lg:p-7 ${className}`}
    >
      <Field label="Full Name" error={errors.fullName?.message}>
        <input {...register("fullName")} placeholder="e.g. John Doe" className={inputCls(!!errors.fullName)} />
      </Field>

      <div className="flex flex-col gap-5 lg:flex-row">
        <Field label="Email" error={errors.email?.message} className="flex-1">
          <input {...register("email")} type="email" placeholder="e.g. abc@yourcompany.com" className={inputCls(!!errors.email)} />
        </Field>

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
      </div>

      <Field label="Position you are applying for" error={errors.position?.message}>
        <FormSelect control={control} name="position" placeholder="Select" options={positionOptions} hasError={!!errors.position} />
      </Field>

      <div className="flex flex-col gap-5 lg:flex-row">
        <Field label="Years of experience" error={errors.experience?.message} className="flex-1">
          <FormSelect control={control} name="experience" placeholder="Select" options={experienceOptions} hasError={!!errors.experience} />
        </Field>

        <Field label="Current Location" error={errors.location?.message} className="flex-1">
          <input {...register("location")} placeholder="e.g. Vadodara, India" className={inputCls(!!errors.location)} />
        </Field>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        <Field label="Expected Salary" className="flex-1">
          <input {...register("expectedSalary")} placeholder="e.g. 50 LPA" className={inputCls(false)} />
        </Field>

        <Field label="Notice Period" className="flex-1">
          <input {...register("noticePeriod")} placeholder="e.g. 2 months" className={inputCls(false)} />
        </Field>
      </div>

      <Field label="Why do you want to join us?" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={4}
          placeholder="Share your application, specifications, or problem you're trying to solve"
          className={`w-full px-5 py-3 bg-gray-50 rounded-xl outline outline-1 -outline-offset-1 text-base font-medium font-montserrat text-stone-900 placeholder:text-neutral-400 outline-none resize-none ${errors.message ? "outline-red-400" : "outline-gray-200"}`}
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

      {submitError && <p className="text-sm font-medium font-montserrat text-red-600">{submitError}</p>}

      {isSubmitSuccessful ? (
        <p className="text-sm font-medium font-montserrat text-green-600">
          Application submitted! We&apos;ll be in touch soon.
        </p>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3.5 bg-orange-600 rounded-full text-white text-sm font-semibold font-montserrat uppercase leading-5 hover:bg-stone-900 transition-colors duration-150 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting…" : "Submit all details"}
        </button>
      )}
    </form>
  );
}
