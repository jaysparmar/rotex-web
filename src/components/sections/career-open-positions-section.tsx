"use client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "@/components/ui/job-card";
import { cn } from "@/lib/utils";
import type { JobCardJob as Job } from "@/components/ui/job-card";

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
        <h2 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
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
              <JobCard key={job.id} job={job} experienceOptions={experienceOptions} positionOptions={positionOptions} />
            ))
          ) : (
            <p className="text-center text-stone-400 py-14">No open positions match this filter right now.</p>
          )}
        </div>
      </div>
    </section>
  );
}
