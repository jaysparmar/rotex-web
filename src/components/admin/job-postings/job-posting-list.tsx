"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, MapPin, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteJobPosting, toggleJobPostingPublished } from "@/app/admin/(dashboard)/job-postings/actions";

type JobPosting = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  published: boolean;
};

export function JobPostingList({
  jobs,
  total,
  page,
  pageSize,
}: {
  jobs: JobPosting[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<JobPosting | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    return `${pathname}?${params.toString()}`;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
      <div className="flex justify-end">
        <Link href="/admin/job-postings/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            Add Job Posting
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState icon={Briefcase} title="No job postings yet" description="Add a job posting to get started." />
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
    </div>
  );
}
