"use client";

import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type MultiSelectOption = { id: string; label: string };

/** Flat multi-select dropdown — collapsed trigger styled like the app's standard
 * Select, checklist inside the popover. */
export function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder,
  emptyMessage,
}: {
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  emptyMessage: string;
}) {
  const labelById = new Map(options.map((o) => [o.id, o.label]));
  const selectedLabels = selectedIds.map((id) => labelById.get(id)).filter(Boolean) as string[];
  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.length} selected`;

  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...new Set([...selectedIds, id])] : selectedIds.filter((v) => v !== id));
  }

  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors">
        <span className="truncate text-left">{summary}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 max-h-96 overflow-y-auto p-2">
        {options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer">
            <Checkbox
              checked={selectedIds.includes(opt.id)}
              onCheckedChange={(checked) => toggle(opt.id, checked === true)}
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
