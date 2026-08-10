"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { savePartnerToolsSection } from "@/app/admin/(dashboard)/partner-sales-tools/actions";

type FormValues = { enabled: boolean; title: string; description: string };

export function PartnerToolsHeroForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description: string };
}) {
  const form = useForm<FormValues>({
    defaultValues: { enabled: initialEnabled, title: initialData.title, description: initialData.description },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await savePartnerToolsSection("hero", { enabled, data });
        toast.success("Hero section saved");
      } catch (err) {
        toast.error("Failed to save Hero section");
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
