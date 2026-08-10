"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveContactSection } from "@/app/admin/(dashboard)/contact/actions";

type FormValues = {
  enabled: boolean;
  breadcrumbLabel: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export function ContactHeroForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: Omit<FormValues, "enabled">;
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveContactSection("hero", { enabled, data });
        toast.success("Hero section saved");
      } catch (err) {
        toast.error("Failed to save hero section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Breadcrumb Label" {...form.register("breadcrumbLabel")} />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />
        <TextField label="CTA Label" {...form.register("ctaLabel")} />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
