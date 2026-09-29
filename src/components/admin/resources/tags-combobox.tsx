"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Dropdown of existing tags to pick from, with a text box inside the popover to add a
 * brand-new tag that isn't in the list yet. Selected tags also show as removable chips
 * below the trigger. */
export function TagsCombobox({
  existingTags,
  selected,
  onChange,
}: {
  existingTags: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const allOptions = [...new Set([...existingTags, ...selected])].sort((a, b) => a.localeCompare(b));
  const filtered = query.trim() ? allOptions.filter((t) => t.toLowerCase().includes(query.trim().toLowerCase())) : allOptions;
  const canCreate = query.trim() && !allOptions.some((t) => t.toLowerCase() === query.trim().toLowerCase());

  function toggle(tag: string, checked: boolean) {
    onChange(checked ? [...selected, tag] : selected.filter((t) => t !== tag));
  }

  function createTag() {
    const tag = query.trim();
    if (!tag) return;
    if (!selected.includes(tag)) onChange([...selected, tag]);
    setQuery("");
  }

  const summary = selected.length === 0 ? "Select tags" : selected.length <= 2 ? selected.join(", ") : `${selected.length} selected`;

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors">
          <span className="truncate text-left">{summary}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <Input
            placeholder="Search or add a tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createTag();
              }
            }}
            className="mb-2"
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((tag) => (
              <label key={tag} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer">
                <Checkbox checked={selected.includes(tag)} onCheckedChange={(checked) => toggle(tag, checked === true)} />
                <span className="text-sm">{tag}</span>
              </label>
            ))}
            {filtered.length === 0 && !canCreate && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">No tags yet.</p>
            )}
            {canCreate && (
              <button
                type="button"
                onClick={createTag}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-primary hover:bg-muted"
              >
                Add &quot;{query.trim()}&quot;
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span
              key={tag}
              className={cn(
                "flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium"
              )}
            >
              {tag}
              <button type="button" onClick={() => onChange(selected.filter((t) => t !== tag))} className="text-muted-foreground hover:text-foreground">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
