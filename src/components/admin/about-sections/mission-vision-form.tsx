"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextAreaField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type FormValues = { enabled: boolean; mission: string; vision: string };

export function MissionVisionForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { mission: string; vision: string };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("mission-vision", { enabled, data });
        toast.success("Mission & Vision section saved");
      } catch (err) {
        toast.error("Failed to save Mission & Vision section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextAreaField label="Mission" rows={4} {...form.register("mission")} />
        <TextAreaField label="Vision" rows={4} {...form.register("vision")} />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
