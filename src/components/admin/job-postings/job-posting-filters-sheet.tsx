"use client";

import { useState } from "react";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SelectField, FieldGrid } from "@/components/admin/form-fields";
import { EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/job-posting-constants";
import { FILTER_KEYS, type JobPostingFilterParams } from "@/lib/job-posting-filters";

const NONE = "__none__";

function filtersKey(f: JobPostingFilterParams) {
  return FILTER_KEYS.map((k) => f[k] ?? "").join("|");
}

export function JobPostingFiltersSheet({
  open,
  onOpenChange,
  filters,
  categories,
  locations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: JobPostingFilterParams;
  categories: string[];
  locations: string[];
}) {
  const { searchParams, pathname, router } = useAdminListUrl();

  const [pending, setPending] = useState<JobPostingFilterParams>(filters);
  const [prevKey, setPrevKey] = useState(filtersKey(filters));
  const [prevOpen, setPrevOpen] = useState(open);

  if (filtersKey(filters) !== prevKey) {
    setPrevKey(filtersKey(filters));
    setPending(filters);
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setPending(filters);
  }

  function set<K extends keyof JobPostingFilterParams>(key: K, value: string) {
    setPending((p) => ({ ...p, [key]: value === NONE || !value ? undefined : value }));
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams);
    if (pending.q) params.set("q", pending.q);
    for (const key of FILTER_KEYS) {
      const value = pending[key];
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    onOpenChange(false);
  }

  function resetFilters() {
    const params = new URLSearchParams(searchParams);
    for (const key of FILTER_KEYS) params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Job Postings</SheetTitle>
          <SheetDescription>Narrow the list by status, category, location, or type.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <SelectField
            label="Status"
            options={[
              { value: NONE, label: "— Any —" },
              { value: "true", label: "Published" },
              { value: "false", label: "Unpublished" },
            ]}
            value={pending.published ?? NONE}
            onChange={(e) => set("published", e.target.value)}
          />
          <FieldGrid>
            <SelectField
              label="Category"
              options={[{ value: NONE, label: "— Any —" }, ...categories.map((c) => ({ value: c, label: c }))]}
              value={pending.category ?? NONE}
              onChange={(e) => set("category", e.target.value)}
            />
            <SelectField
              label="Location"
              options={[{ value: NONE, label: "— Any —" }, ...locations.map((l) => ({ value: l, label: l }))]}
              value={pending.location ?? NONE}
              onChange={(e) => set("location", e.target.value)}
            />
          </FieldGrid>
          <FieldGrid>
            <SelectField
              label="Employment Type"
              options={[{ value: NONE, label: "— Any —" }, ...EMPLOYMENT_TYPES.map((v) => ({ value: v, label: v }))]}
              value={pending.employmentType ?? NONE}
              onChange={(e) => set("employmentType", e.target.value)}
            />
            <SelectField
              label="Work Mode"
              options={[{ value: NONE, label: "— Any —" }, ...WORK_MODES.map((v) => ({ value: v, label: v }))]}
              value={pending.workMode ?? NONE}
              onChange={(e) => set("workMode", e.target.value)}
            />
          </FieldGrid>
        </div>

        <SheetFooter className="flex-row justify-between">
          <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
          <Button type="button" size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
