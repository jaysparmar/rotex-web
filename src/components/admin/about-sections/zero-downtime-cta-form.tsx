"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type CtaButton = { label: string; href: string };
type FormValues = {
  enabled: boolean;
  title: string;
  description: string;
  ctaPrimary: CtaButton;
  ctaSecondary: CtaButton;
};

export function ZeroDowntimeCtaForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description: string; ctaPrimary: CtaButton; ctaSecondary: CtaButton };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("zero-downtime-cta", { enabled, data });
        toast.success("Zero Downtime CTA section saved");
      } catch (err) {
        toast.error("Failed to save Zero Downtime CTA section");
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

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Primary CTA</span>
          <FieldGrid>
            <TextField label="Label" {...form.register("ctaPrimary.label")} />
            <TextField label="Href" {...form.register("ctaPrimary.href")} />
          </FieldGrid>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Secondary CTA</span>
          <FieldGrid>
            <TextField label="Label" {...form.register("ctaSecondary.label")} />
            <TextField label="Href" {...form.register("ctaSecondary.href")} />
          </FieldGrid>
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
