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
import { TextField, SelectField } from "@/components/admin/form-fields";
import { DocumentField } from "@/components/admin/document-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { DOWNLOAD_TABS } from "@/lib/downloads-data";
import { createDownload, updateDownload } from "@/app/admin/(dashboard)/downloads/actions";

type DownloadFormValues = {
  title: string;
  categoryId: string;
  tab: string;
  file: { src: string };
};

export function DownloadFormDialog({
  download,
  categories,
  trigger,
}: {
  download?: { id: string; title: string; categoryId: string; tab: string | null; fileUrl: string };
  categories: { id: string; name: string }[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<DownloadFormValues>({
    defaultValues: {
      title: download?.title ?? "",
      categoryId: download?.categoryId ?? "",
      tab: download?.tab ?? DOWNLOAD_TABS[0].id,
      file: { src: download?.fileUrl ?? "" },
    },
  });
  const { pending, error, run } = useSaveAction();
  const categoryIdValue = form.watch("categoryId");

  function onSubmit(values: DownloadFormValues) {
    if (!values.categoryId) {
      toast.error("Choose a category");
      return;
    }
    const payload = {
      title: values.title,
      fileUrl: values.file.src,
      tab: values.tab || null,
      categoryId: values.categoryId,
    };
    if (!payload.fileUrl) {
      toast.error("Choose a file to upload");
      return;
    }
    run(async () => {
      try {
        if (download) {
          await updateDownload(download.id, payload);
        } else {
          await createDownload(payload);
        }
      } catch (err) {
        toast.error(download ? "Failed to update download" : "Failed to add download");
        throw err;
      }
      toast.success(download ? "Download updated" : "Download added");
      setOpen(false);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{download ? "Edit Download" : "Add Download"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField label="Title" {...form.register("title", { required: true })} />
            <SelectField
              label="Category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Choose category..."
              value={categoryIdValue}
              onChange={(e) => form.setValue("categoryId", e.target.value)}
            />
            {!categoryIdValue && <p className="text-sm text-destructive">Category is required.</p>}
            <SelectField
              label="Downloads Page Section"
              options={DOWNLOAD_TABS.map((t) => ({ value: t.id, label: t.label }))}
              value={form.watch("tab")}
              onChange={(e) => form.setValue("tab", e.target.value)}
            />
            <DocumentField name="file" label="Download File" />
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
