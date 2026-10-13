"use client";

import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const ALL = "All";

// value/onChange are always arrays — an empty array means "All". Single-select
// categories (Product, Sub Category) just keep at most one entry; multi:true
// categories (Industry) can hold several, toggling instead of replacing and
// staying open instead of auto-closing on each pick.
export type FilterCategoryConfig = {
  id: string;
  rowLabel: string;
  panelTitle: string;
  allLabel: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  multiple?: boolean;
};

export function MobileDownloadsFilters({
  categories,
  hasActiveFilters,
  activeFilterCount,
  clearFilters,
}: {
  categories: FilterCategoryConfig[];
  hasActiveFilters: boolean;
  activeFilterCount: number;
  clearFilters: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);

  const activePanel = categories.find((c) => c.id === panel) ?? null;

  function selectValue(cat: FilterCategoryConfig, v: string) {
    if (v === ALL) {
      cat.onChange([]);
      if (!cat.multiple) setPanel(null);
      return;
    }
    if (cat.multiple) {
      cat.onChange(cat.value.includes(v) ? cat.value.filter((o) => o !== v) : [...cat.value, v]);
      return;
    }
    cat.onChange([v]);
    setPanel(null);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="w-full px-2 py-3 bg-neutral-100 rounded-sm flex justify-center items-center gap-2.5 text-stone-900 text-sm font-semibold font-montserrat leading-6"
      >
        Filters
        {activeFilterCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-[#EF3E23] text-xs font-semibold font-montserrat text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Main filters bottom sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto px-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col gap-2">
                <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase leading-5">
                  {cat.rowLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setPanel(cat.id)}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline-1 -outline-offset-1 outline-gray-200 text-left text-sm font-medium font-montserrat"
                >
                  <span className={cat.value.length === 0 ? "text-neutral-400" : "text-stone-900"}>
                    {cat.value.length === 0
                      ? cat.placeholder
                      : cat.value.length === 1
                        ? cat.value[0]
                        : `${cat.value[0]} +${cat.value.length - 1} more`}
                  </span>
                </button>
              </div>
            ))}
          </div>
          <SheetFooter className="flex-row items-center gap-4">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 text-[#EF3E23] text-xs font-semibold font-montserrat hover:underline"
              >
                Clear Filters
              </button>
            )}
            <Button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 h-12 rounded-full bg-[#EF3E23] text-white text-sm font-bold font-montserrat uppercase hover:bg-[#d63418]"
            >
              Show Results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Per-field value picker bottom sheet, stacked above the filters sheet */}
      <Sheet open={activePanel !== null} onOpenChange={(next) => !next && setPanel(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          {activePanel && (
            <>
              <SheetHeader className="flex-row items-center gap-2 pr-9">
                <button type="button" onClick={() => setPanel(null)} className="text-[#EF3E23]">
                  <ChevronLeft className="size-4" />
                </button>
                <SheetTitle className="text-[#EF3E23]">{activePanel.panelTitle}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <button
                  type="button"
                  onClick={() => selectValue(activePanel, ALL)}
                  className="flex w-full items-center justify-between gap-3 border-b border-stone-100 py-3 text-left text-sm font-montserrat text-stone-900"
                >
                  {activePanel.allLabel}
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                      activePanel.value.length === 0 ? "border-[#EF3E23] bg-[#EF3E23]" : "border-stone-300"
                    }`}
                  >
                    {activePanel.value.length === 0 && <Check className="size-3 text-white" />}
                  </span>
                </button>
                {activePanel.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => selectValue(activePanel, opt)}
                    className="flex w-full items-center justify-between gap-3 border-b border-stone-100 py-3 text-left text-sm font-montserrat text-stone-900"
                  >
                    {opt}
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                        activePanel.value.includes(opt) ? "border-[#EF3E23] bg-[#EF3E23]" : "border-stone-300"
                      }`}
                    >
                      {activePanel.value.includes(opt) && <Check className="size-3 text-white" />}
                    </span>
                  </button>
                ))}
              </div>
              {/* Multi-select panels don't auto-close on pick (so several can be
                  checked in one visit), so they need an explicit way back —
                  single-select ones already return to the filters list on tap. */}
              {activePanel.multiple && (
                <SheetFooter className="flex-row items-center gap-4">
                  <button
                    type="button"
                    onClick={() => selectValue(activePanel, ALL)}
                    className="shrink-0 text-[#EF3E23] text-xs font-semibold font-montserrat hover:underline"
                  >
                    Clear Selection
                  </button>
                  <Button
                    type="button"
                    onClick={() => setPanel(null)}
                    className="flex-1 h-12 rounded-full bg-[#EF3E23] text-white text-sm font-bold font-montserrat uppercase hover:bg-[#d63418]"
                  >
                    Done
                  </Button>
                </SheetFooter>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
