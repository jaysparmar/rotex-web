"use client";

import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type IndustryTreeOption = { id: string; name: string; subIndustries: { id: string; name: string }[] };

/** Flat selectedIds array mixing Industry ids + SubIndustry ids — same convention
 * as the mega-menu source picker's selectedIds. Checking a parent industry also
 * checks (and filters by) all its sub-industries for the frontend roll-up filter.
 * Collapsed dropdown trigger, tree checklist inside the popover. */
export function IndustryTreePicker({
  industries,
  selectedIds,
  onChange,
}: {
  industries: IndustryTreeOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const allNames = new Map<string, string>();
  industries.forEach((i) => {
    allNames.set(i.id, i.name);
    i.subIndustries.forEach((s) => allNames.set(s.id, s.name));
  });
  const selectedNames = selectedIds.map((id) => allNames.get(id)).filter(Boolean) as string[];
  const summary =
    selectedNames.length === 0
      ? "Select industries"
      : selectedNames.length <= 2
        ? selectedNames.join(", ")
        : `${selectedNames.length} selected`;

  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...new Set([...selectedIds, id])] : selectedIds.filter((v) => v !== id));
  }

  function toggleIndustry(industry: IndustryTreeOption, checked: boolean) {
    const subIds = industry.subIndustries.map((s) => s.id);
    if (checked) {
      onChange([...new Set([...selectedIds, industry.id])]);
    } else {
      onChange(selectedIds.filter((v) => v !== industry.id && !subIds.includes(v)));
    }
  }

  if (industries.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">No industries yet. Add some on the Industries page first.</p>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors">
        <span className="truncate text-left">{summary}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 max-h-96 overflow-y-auto p-2">
        {industries.map((industry) => {
          const industryChecked = selectedIds.includes(industry.id);
          return (
            <div key={industry.id} className="border-b border-border py-2 last:border-b-0">
              <label className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer">
                <Checkbox
                  checked={industryChecked}
                  onCheckedChange={(checked) => toggleIndustry(industry, checked === true)}
                />
                <span className="text-sm font-medium">{industry.name}</span>
              </label>
              {industry.subIndustries.length > 0 && (
                <div className="ml-6">
                  {industry.subIndustries.map((sub) => (
                    <label
                      key={sub.id}
                      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIds.includes(sub.id)}
                        onCheckedChange={(checked) => toggle(sub.id, checked === true)}
                      />
                      <span className="text-sm text-muted-foreground">{sub.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
