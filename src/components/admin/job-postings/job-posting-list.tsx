"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
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


export function JobPostingList({ jobs }: { jobs: JobPosting[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<JobPosting | null>(null);

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

      <div className="divide-y divide-border rounded-lg border border-border">
        {jobs.length === 0 && <p className="p-6 text-sm text-muted-foreground">No job postings yet.</p>}
        {jobs.map((job) => (
          <div key={job.id} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{job.title}</p>
                <span className="shrink-0 rounded-lg bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  {job.category}
                </span>
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
