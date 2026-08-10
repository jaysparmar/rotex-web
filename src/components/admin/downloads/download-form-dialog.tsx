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
import { TextField, FieldGrid, SwitchField, SelectField } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { DocumentField } from "@/components/admin/document-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { createDownloadItem, updateDownloadItem } from "@/app/admin/(dashboard)/downloads/actions";
import { DOWNLOAD_TABS } from "@/lib/downloads-data";

type DownloadFormValues = {
  tab: string;
  title: string;
  language: string;
  fileType: string;
  fileSizeLabel: string;
  file: { src: string };
  image: { src: string };
  product: string;
  subCategory: string;
  productCertificateType: string;
  qmsCertificateType: string;
  industry: string;
  published: boolean;
};

type DownloadItem = {
  id: string;
  tab: string;
  title: string;
  language: string;
  fileType: string;
  fileSizeLabel: string;
  fileUrl: string;
  image: string;
  product: string;
  subCategory: string;
  productCertificateType: string;
  qmsCertificateType: string;
  industry: string;
  published: boolean;
};

export function DownloadFormDialog({ item, trigger }: { item?: DownloadItem; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<DownloadFormValues>({
    defaultValues: {
      tab: item?.tab ?? DOWNLOAD_TABS[0].id,
      title: item?.title ?? "",
      language: item?.language ?? "English",
      fileType: item?.fileType ?? "PDF",
      fileSizeLabel: item?.fileSizeLabel ?? "",
      file: { src: item?.fileUrl ?? "" },
      image: { src: item?.image ?? "" },
      product: item?.product ?? "",
      subCategory: item?.subCategory ?? "",
      productCertificateType: item?.productCertificateType ?? "",
      qmsCertificateType: item?.qmsCertificateType ?? "",
      industry: item?.industry ?? "",
      published: item?.published ?? true,
    },
  });
  const { pending, error, run } = useSaveAction();

  function onSubmit(values: DownloadFormValues) {
    const { file, image, ...rest } = values;
    const payload = { ...rest, fileUrl: file.src, image: image.src };
    run(async () => {
      try {
        if (item) {
          await updateDownloadItem(item.id, payload);
        } else {
          await createDownloadItem(payload);
        }
      } catch (err) {
        toast.error(item ? "Failed to update download" : "Failed to add download");
        throw err;
      }
      toast.success(item ? "Download updated" : "Download added");
      setOpen(false);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Download" : "Add Download"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SelectField
              label="Category"
              options={DOWNLOAD_TABS.map((t) => ({ value: t.id, label: t.label }))}
              defaultValue={item?.tab ?? DOWNLOAD_TABS[0].id}
              {...form.register("tab", { required: true })}
            />
            <TextField label="Title" {...form.register("title", { required: true })} />
            <FieldGrid>
              <TextField label="Language" {...form.register("language")} />
              <TextField label="File Type (e.g. PDF)" {...form.register("fileType")} />
            </FieldGrid>
            <TextField label="File Size Label (e.g. 1.28 MB)" {...form.register("fileSizeLabel")} />
            <DocumentField name="file" label="Download File" />
            <MediaField name="image" mediaType="image" showAlt={false} />
            <FieldGrid>
              <TextField label="Product" {...form.register("product")} />
              <TextField label="Sub Category" {...form.register("subCategory")} />
            </FieldGrid>
            <FieldGrid>
              <TextField label="Product Certificate Type" {...form.register("productCertificateType")} />
              <TextField label="QMS Certificate Type" {...form.register("qmsCertificateType")} />
            </FieldGrid>
            <TextField label="Industry" {...form.register("industry")} />
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
