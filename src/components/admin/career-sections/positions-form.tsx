"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveCareerSection } from "@/app/admin/(dashboard)/career/actions";

type FormValues = { enabled: boolean; heading: string };

export function CareerPositionsForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveCareerSection("positions", { enabled, data });
        toast.success("Open Positions heading saved");
      } catch (err) {
        toast.error("Failed to save Open Positions heading");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />
        <p className="text-xs text-muted-foreground">
          Manage individual job listings on the Job Postings page.
        </p>
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
