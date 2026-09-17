"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, MapPin, Briefcase, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterChips } from "@/components/admin/filter-chips";
import { JobPostingFiltersSheet } from "@/components/admin/job-postings/job-posting-filters-sheet";
import { deleteJobPosting, toggleJobPostingPublished } from "@/app/admin/(dashboard)/job-postings/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";
import { FILTER_KEYS, type JobPostingFilterParams } from "@/lib/job-posting-filters";

type JobPosting = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  published: boolean;
};

function filterFieldLabel(key: (typeof FILTER_KEYS)[number]): string {
  if (key === "published") return "Status";
  if (key === "category") return "Category";
  if (key === "location") return "Location";
  if (key === "employmentType") return "Employment Type";
  return "Work Mode";
}

function resolveFilterLabel(key: (typeof FILTER_KEYS)[number], value: string): string {
  if (key === "published") return value === "true" ? "Published" : "Unpublished";
  return value;
}

export function JobPostingList({
  jobs,
  total,
  page,
  pageSize,
  q,
  filters,
  categories,
  locations,
}: {
  jobs: JobPosting[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  filters: JobPostingFilterParams;
  categories: string[];
  locations: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<JobPosting | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const { pageHref, removeParams, clearAll } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeFilters = FILTER_KEYS.filter((k) => filters[k]);
  const filterChips = activeFilters.map((key) => ({
    key,
    label: filterFieldLabel(key),
    value: resolveFilterLabel(key, filters[key]!),
  }));

  function confirmDelete() {
    if (!toDelete) return;
    const title = toDelete.title;
    startTransition(async () => {
      try {
        await deleteJobPosting(toDelete.id);
        toast.success(`"${title}" deleted`);
      } catch {
        toast.error(`Failed to delete "${title}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(job: JobPosting, published: boolean) {
    startTransition(async () => {
      try {
        await toggleJobPostingPublished(job.id, published);
        toast.success(`"${job.title}" ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error(`Failed to update "${job.title}"`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setFilterSheetOpen(true)}>
            <SlidersHorizontal className="size-3.5" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-0.5 px-1.5">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
          <Link href="/admin/job-postings/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Job Posting
            </Button>
          </Link>
        </div>
      </div>

      <FilterChips
        chips={filterChips}
        onRemove={(key) => removeParams([key])}
        onClearAll={() => clearAll([...FILTER_KEYS])}
      />

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={Briefcase}
            title={q || activeFilters.length > 0 ? "No job postings match your filters" : "No job postings yet"}
            description={
              q || activeFilters.length > 0 ? "Try a different search or filter." : "Add a job posting to get started."
            }
          />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{job.title}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {job.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {job.location} — {job.company}
                </div>
              </div>

              <Switch
                checked={job.published}
                disabled={pending}
                onCheckedChange={(v) => handleTogglePublished(job, v)}
              />

              <Link href={`/admin/job-postings/${job.id}`}>
                <Button variant="ghost" size="icon-sm">
                  <Pencil className="size-3.5" />
                </Button>
              </Link>

              <Button variant="ghost" size="icon-sm" disabled={pending} onClick={() => setToDelete(job)}>
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          itemLabel="job posting"
          pageHref={pageHref}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete job posting"
        description={`Delete job posting "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />

      <JobPostingFiltersSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        categories={categories}
        locations={locations}
      />
    </div>
  );
}
