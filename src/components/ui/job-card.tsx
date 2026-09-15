import { MapPin } from "lucide-react";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { JobDetailSheet } from "@/components/sections/job-detail-sheet";

export type JobCardJob = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  employmentType: string;
  workMode: string;
  aboutRole: string;
  whatYouDo: string[];
  whatWeLookFor: string[];
  whatYouGet: { icon: string; label: string }[];
};

export function JobCard({
  job,
  experienceOptions,
  positionOptions,
}: {
  job: JobCardJob;
  experienceOptions?: string[];
  positionOptions?: string[];
}) {
  return (
    <div className="bg-white rounded-xl border-l-4 border-transparent hover:border-[#EF3E23] transition-colors duration-300 p-6 flex flex-col gap-3">
      <p className="text-zinc-800 font-montserrat font-medium text-sm leading-5">{job.company}</p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-stone-500 font-montserrat font-semibold text-lg leading-6">{job.title}</h3>
            <span className="px-2 py-1 rounded-lg bg-red-50 text-[#EF3E23] text-xs font-medium font-montserrat leading-4">
              {job.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-neutral-400" strokeWidth={1.5} />
            <span className="text-neutral-400 font-montserrat font-medium text-sm leading-5">{job.location}</span>
          </div>
        </div>

        <JobDetailSheet
          job={job}
          experienceOptions={experienceOptions}
          positionOptions={positionOptions}
          trigger={
            <button
              type="button"
              className="inline-flex w-fit shrink-0 items-center gap-2.5 pl-4 pr-2.5 py-2 rounded-[45px] bg-white outline outline-1 -outline-offset-1 outline-[#EF3E23] text-[#EF3E23] font-montserrat font-medium text-sm leading-6 hover:bg-red-50 transition-colors"
            >
              View Details
              <RotexArrow size={7} />
            </button>
          }
        />
      </div>

      {job.tag && (
        <span className="w-fit px-1.5 py-1 bg-neutral-100 text-neutral-400 font-montserrat font-medium text-sm leading-5">
          {job.tag}
        </span>
      )}
    </div>
  );
}
