"use client";

import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

/** Multi-select by industry name (not id) — used where the stored value is a
 * plain string list (e.g. a public form's dropdown options), not a relation. */
export function IndustryNamesPicker({
  allIndustryNames,
  selected,
  onChange,
}: {
  allIndustryNames: string[];
  selected: string[];
  onChange: (names: string[]) => void;
}) {
  const summary =
    selected.length === 0 ? "Select industries" : selected.length <= 2 ? selected.join(", ") : `${selected.length} selected`;

  function toggle(name: string, checked: boolean) {
    onChange(checked ? [...new Set([...selected, name])] : selected.filter((v) => v !== name));
  }

  if (allIndustryNames.length === 0) {
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
      <PopoverContent align="start" className="w-80 max-h-80 overflow-y-auto p-2">
        {allIndustryNames.map((name) => (
          <label key={name} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer">
            <Checkbox checked={selected.includes(name)} onCheckedChange={(checked) => toggle(name, checked === true)} />
            <span className="text-sm">{name}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
