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
import { TextField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { createDownloadCategory, updateDownloadCategory } from "@/app/admin/(dashboard)/download-categories/actions";

type DownloadCategoryFormValues = {
  name: string;
};

export function DownloadCategoryFormDialog({
  category,
  trigger,
}: {
  category?: { id: string; name: string };
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<DownloadCategoryFormValues>({
    defaultValues: {
      name: category?.name ?? "",
    },
  });
  const { pending, error, run } = useSaveAction();

  function onSubmit(values: DownloadCategoryFormValues) {
    const payload = { name: values.name };
    run(async () => {
      try {
        if (category) {
          await updateDownloadCategory(category.id, payload);
        } else {
          await createDownloadCategory(payload);
        }
      } catch (err) {
        toast.error(category ? "Failed to update category" : "Failed to add category");
        throw err;
      }
      toast.success(category ? "Category updated" : "Category added");
      setOpen(false);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Download Category" : "Add Download Category"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField label="Name" {...form.register("name", { required: true })} />
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
