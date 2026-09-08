"use client";
import { useRef } from "react";
import { MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PerkIcon, PerkIconGradientDefs } from "@/lib/job-perk-icons";
import { JobApplicationForm } from "@/components/sections/job-application-form";
import { HexIcon } from "@/components/ui/hex-icon";

export type JobDetail = {
  id: string;
  title: string;
  category: string;
  location: string;
  employmentType: string;
  workMode: string;
  aboutRole: string;
  whatYouDo?: string[] | null;
  whatWeLookFor?: string[] | null;
  whatYouGet?: { icon: string; label: string }[] | null;
};

export function JobDetailSheet({
  job,
  trigger,
  experienceOptions,
  positionOptions,
}: {
  job: JobDetail;
  trigger: React.ReactNode;
  experienceOptions?: string[];
  positionOptions?: string[];
}) {
  const formRef = useRef<HTMLDivElement>(null);
  const whatYouDo = job.whatYouDo ?? [];
  const whatWeLookFor = job.whatWeLookFor ?? [];
  const whatYouGet = job.whatYouGet ?? [];

  return (
    <Sheet>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent className="data-[side=right]:sm:max-w-2xl data-[side=right]:w-full overflow-y-auto p-0">
        <PerkIconGradientDefs />
        <div className="flex flex-col gap-8 p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <span className="w-fit px-2 py-1 rounded-lg bg-red-50 text-[#EF3E23] text-xs font-medium font-montserrat leading-4">
                {job.category}
              </span>
              <button
                type="button"
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="shrink-0 rounded-full px-3.5 py-1.5 outline outline-1 -outline-offset-1 outline-red-200 text-[#EF3E23] text-sm font-bold font-montserrat uppercase leading-5 hover:bg-red-50 transition-colors"
              >
                Apply Now
              </button>
            </div>

            <h2 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-3xl leading-8 lg:leading-9">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-stone-500 font-montserrat font-medium text-sm leading-5">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-neutral-400" strokeWidth={1.5} />
                {job.location}
              </span>
              <span className="text-neutral-300">|</span>
              <span>{job.employmentType}</span>
              <span className="text-neutral-300">|</span>
              <span>{job.workMode}</span>
            </div>
          </div>

          <div className="border-t border-neutral-200" />

          {/* About the Role */}
          {job.aboutRole && (
            <div className="flex flex-col gap-3">
              <h3 className="text-stone-900 font-montserrat font-semibold text-sm leading-5">About the Role</h3>
              <p className="border-l-4 border-neutral-400 bg-neutral-100 px-5 py-4 text-zinc-800 font-montserrat font-medium text-sm leading-5">
                {job.aboutRole}
              </p>
            </div>
          )}

          {/* What You'll Do */}
          {whatYouDo.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-stone-900 font-montserrat font-semibold text-sm leading-5">What You&apos;ll Do</h3>
              <ul className="flex flex-col gap-3">
                {whatYouDo.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 shrink-0">
                      <HexIcon size={12} />
                    </span>
                    <span className="text-zinc-800 font-montserrat font-medium text-sm leading-5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What We're Looking For */}
          {whatWeLookFor.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-stone-900 font-montserrat font-semibold text-sm leading-5">
                What We&apos;re Looking For
              </h3>
              <ul className="flex flex-col gap-3">
                {whatWeLookFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 shrink-0">
                      <HexIcon size={12} />
                    </span>
                    <span className="text-zinc-800 font-montserrat font-medium text-sm leading-5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What You Get */}
          {whatYouGet.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-stone-900 font-montserrat font-semibold text-sm leading-5">What You Get</h3>
              <div className="flex flex-wrap gap-3">
                {whatYouGet.map((perk, i) => (
                  <div
                    key={i}
                    className="flex w-44 flex-col gap-1 rounded-[10px] bg-gray-50 px-3 pt-3.5 pb-3 outline outline-[0.8px] -outline-offset-1 outline-gray-100"
                  >
                    <PerkIcon iconKey={perk.icon} />
                    <span className="text-gray-700 font-montserrat font-medium text-xs leading-4">{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-neutral-200" />

          {/* Application form */}
          <div ref={formRef} className="scroll-mt-6">
            <JobApplicationForm
              defaultPosition={job.title}
              experienceOptions={experienceOptions}
              positionOptions={positionOptions ?? [job.title]}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
