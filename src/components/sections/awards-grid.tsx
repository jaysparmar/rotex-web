"use client";

import { useMemo, useState } from "react";
import { AwardCard, type AwardCardProps } from "@/components/ui/award-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 6;

export function AwardsGrid({ awards }: { awards: AwardCardProps[] }) {
  const years = useMemo(
    () => Array.from(new Set(awards.map((a) => a.year))).sort((a, b) => Number(b) - Number(a)),
    [awards]
  );

  const [yearFilter, setYearFilter] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredAwards = yearFilter ? awards.filter((a) => a.year === yearFilter) : awards;

  const visibleAwards = filteredAwards.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAwards.length;

  return (
    <div className="container py-12 flex flex-col gap-8">
      {/* Filter bar */}
      <div className="flex justify-end items-center gap-5">
        <span className="text-black text-base font-medium font-montserrat leading-6">Filter by:</span>
        <Select
          items={[{ value: "All Years", label: "All Years" }, ...years.map((y) => ({ value: y, label: y }))]}
          value={yearFilter || "All Years"}
          onValueChange={(v) => {
            setYearFilter(v === "All Years" ? "" : (v ?? ""));
            setVisibleCount(PAGE_SIZE);
          }}
        >
          <SelectTrigger className="w-auto h-11 px-5 py-2.5 bg-zinc-100 rounded-xl border-0 gap-5 text-stone-900 text-base font-medium font-montserrat">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Years">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {visibleAwards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleAwards.map((award) => (
            <AwardCard key={award.slug} {...award} />
          ))}
        </div>
      ) : (
        <p className="text-stone-400 text-center py-20">No awards found.</p>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-6 py-3 rounded-full outline outline-1 -outline-offset-1 outline-red-600 text-red-600 font-montserrat font-semibold text-sm uppercase leading-5 hover:bg-red-600 hover:text-white transition-colors duration-150"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
