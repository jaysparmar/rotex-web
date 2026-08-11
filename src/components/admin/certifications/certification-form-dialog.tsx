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
import { TextField, SwitchField } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { createCertification, updateCertification } from "@/app/admin/(dashboard)/certifications/actions";

type CertificationFormValues = {
  name: string;
  published: boolean;
  logo: { src: string };
};

export function CertificationFormDialog({
  certification,
  trigger,
}: {
  certification?: { id: string; name: string; logo: string; published: boolean };
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<CertificationFormValues>({
    defaultValues: {
      name: certification?.name ?? "",
      published: certification?.published ?? true,
      logo: { src: certification?.logo ?? "" },
    },
  });
  const { pending, error, run } = useSaveAction();

  function onSubmit(values: CertificationFormValues) {
    const payload = { name: values.name, logo: values.logo.src, published: values.published };
    run(async () => {
      try {
        if (certification) {
          await updateCertification(certification.id, payload);
        } else {
          await createCertification(payload);
        }
      } catch (err) {
        toast.error(certification ? "Failed to update certification" : "Failed to add certification");
        throw err;
      }
      toast.success(certification ? "Certification updated" : "Certification added");
      setOpen(false);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{certification ? "Edit Certification" : "Add Certification"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField label="Name" {...form.register("name", { required: true })} />
            <MediaField name="logo" mediaType="image" showAlt={false} />
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
