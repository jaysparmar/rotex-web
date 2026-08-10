"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { cn } from "@/lib/utils";

type Job = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
};

type CareerOpenPositionsSectionProps = {
  heading?: string;
  jobs?: Job[];
};

export function CareerOpenPositionsSection({ heading = "Open Positions", jobs = [] }: CareerOpenPositionsSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [company, setCompany] = useState("");

  const categories = ["All", ...Array.from(new Set(jobs.map((j) => j.category)))];
  const companies = Array.from(new Set(jobs.map((j) => j.company)));

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = activeCategory === "All" || job.category === activeCategory;
    const matchesCompany = !company || job.company === company;
    return matchesCategory && matchesCompany;
  });

  return (
    <section className="bg-neutral-100 py-14 lg:py-20">
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
              <Select value={company} onValueChange={(v) => setCompany(v ?? "")}>
                <SelectTrigger className="w-full h-auto px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline outline-1 -outline-offset-1 outline-gray-200 text-base font-medium font-montserrat text-stone-900 data-placeholder:text-neutral-400">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
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
              <div key={job.id} className="bg-white rounded-xl border-l-4 border-red-600 p-6 flex flex-col gap-3">
                <p className="text-zinc-800 font-montserrat font-medium text-sm leading-5">{job.company}</p>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-stone-500 font-montserrat font-semibold text-lg leading-6">{job.title}</h3>
                      <span className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium font-montserrat leading-4">
                        {job.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-4 text-neutral-400" strokeWidth={1.5} />
                      <span className="text-neutral-400 font-montserrat font-medium text-sm leading-5">{job.location}</span>
                    </div>
                  </div>

                  <a
                    href="#form"
                    className="inline-flex w-fit shrink-0 items-center gap-2.5 pr-2.5 text-red-600 font-montserrat font-medium text-sm leading-6 hover:opacity-80 transition-opacity"
                  >
                    Apply Now
                    <RotexArrow size={7} />
                  </a>
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
