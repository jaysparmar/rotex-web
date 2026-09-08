"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { JobDetailSheet } from "@/components/sections/job-detail-sheet";
import { cn } from "@/lib/utils";

type Job = {
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

type CareerOpenPositionsSectionProps = {
  heading?: string;
  jobs?: Job[];
  experienceOptions?: string[];
  positionOptions?: string[];
};

export function CareerOpenPositionsSection({
  heading = "Open Positions",
  jobs = [],
  experienceOptions,
  positionOptions,
}: CareerOpenPositionsSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [company, setCompany] = useState("All");

  const categories = ["All", ...Array.from(new Set(jobs.map((j) => j.category)))];
  const companies = Array.from(new Set(jobs.map((j) => j.company)));

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = activeCategory === "All" || job.category === activeCategory;
    const matchesCompany = company === "All" || job.company === company;
    return matchesCategory && matchesCompany;
  });

  return (
    <section id="positions" className="scroll-mt-24 lg:scroll-mt-32 bg-neutral-100 py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:gap-14">
        <h2 className="text-center text-gradient-orange-dark font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
          {heading}
        </h2>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
          <div className="no-scrollbar flex-1 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium font-montserrat leading-5 transition-colors duration-150",
                  cat === activeCategory
                    ? "bg-stone-900 text-white outline outline-1 -outline-offset-1 outline-stone-900"
                    : "bg-white text-stone-900 outline outline-1 -outline-offset-1 outline-neutral-200 hover:bg-stone-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {companies.length > 0 && (
            <div className="w-full lg:w-64 lg:shrink-0">
              <Select
                items={[{ value: "All", label: "All Companies" }, ...companies.map((c) => ({ value: c, label: c }))]}
                value={company}
                onValueChange={(v) => setCompany(v ?? "All")}
              >
                <SelectTrigger className="w-full h-auto px-3 py-2.5 bg-white rounded-lg border-0 outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-stone-900 data-placeholder:text-stone-400">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Companies</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border-l-4 border-transparent hover:border-[#EF3E23] transition-colors duration-300 p-6 flex flex-col gap-3">
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
            ))
          ) : (
            <p className="text-center text-stone-400 py-14">No open positions match this filter right now.</p>
          )}
        </div>
      </div>
    </section>
  );
}
