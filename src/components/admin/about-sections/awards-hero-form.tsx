"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type FormValues = { enabled: boolean; title: string; description: string };

export function AwardsHeroForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description: string };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("awards", { enabled, data });
        toast.success("Awards section saved");
      } catch (err) {
        toast.error("Failed to save Awards section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
