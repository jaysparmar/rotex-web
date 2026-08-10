"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField, FieldGrid, SwitchField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { createJobPosting, updateJobPosting } from "@/app/admin/(dashboard)/job-postings/actions";

type JobPostingFormValues = {
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  published: boolean;
};

type JobPosting = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  published: boolean;
};

export function JobPostingFormDialog({ job, trigger }: { job?: JobPosting; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<JobPostingFormValues>({
    defaultValues: {
      company: job?.company ?? "Rotex Automation Limited",
      title: job?.title ?? "",
      category: job?.category ?? "",
      location: job?.location ?? "",
      tag: job?.tag ?? "",
      published: job?.published ?? true,
    },
  });
  const { pending, error, run } = useSaveAction();

  function onSubmit(values: JobPostingFormValues) {
    run(async () => {
      try {
        if (job) {
          await updateJobPosting(job.id, values);
        } else {
          await createJobPosting(values);
        }
      } catch (err) {
        toast.error(job ? "Failed to update job posting" : "Failed to add job posting");
        throw err;
      }
      toast.success(job ? "Job posting updated" : "Job posting added");
      setOpen(false);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job Posting" : "Add Job Posting"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField label="Job Title" {...form.register("title", { required: true })} />
            <TextField label="Company" {...form.register("company", { required: true })} />
            <FieldGrid>
              <TextField label="Category" {...form.register("category", { required: true })} />
              <TextField label="Location" {...form.register("location", { required: true })} />
            </FieldGrid>
            <TextField label="Tag (e.g. Solenoid Valves)" {...form.register("tag")} />
            <SwitchField
              label="Published"
              checked={form.watch("published")}
              onCheckedChange={(v) => form.setValue("published", v)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
