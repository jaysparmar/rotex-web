"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveSupplierSection } from "@/app/admin/(dashboard)/supplier/actions";

type Stat = { value: string; label: string };
type FormValues = {
  enabled: boolean;
  heading: string;
  description: string;
  stats: Stat[];
  benefits: { text: string }[];
  cta: { label: string; href: string };
};

export function SupplierBenefitsForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: {
    heading: string;
    description: string;
    stats: Stat[];
    benefits: string[];
    cta: { label: string; href: string };
  };
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      description: initialData.description,
      stats: initialData.stats,
      benefits: initialData.benefits.map((text) => ({ text })),
      cta: initialData.cta,
    },
  });
  const statsArray = useFieldArray({ control: form.control, name: "stats" });
  const benefitsArray = useFieldArray({ control: form.control, name: "benefits" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, benefits, ...rest } = values;
    const data = { ...rest, benefits: benefits.map((b) => b.text) };
    run(async () => {
      try {
        await saveSupplierSection("benefits", { enabled, data });
        toast.success("Benefits section saved");
      } catch (err) {
        toast.error("Failed to save Benefits section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stats</span>
          {statsArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Stat ${i + 1}`} onRemove={() => statsArray.remove(i)}>
              <FieldGrid>
                <TextField label="Value" {...form.register(`stats.${i}.value`)} />
                <TextField label="Label" {...form.register(`stats.${i}.label`)} />
              </FieldGrid>
            </RepeaterItem>
          ))}
          <AddButton label="Add Stat" onClick={() => statsArray.append({ value: "", label: "" })} />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Benefits list</span>
          {benefitsArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Benefit ${i + 1}`} onRemove={() => benefitsArray.remove(i)}>
              <TextField label="Text" {...form.register(`benefits.${i}.text`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Benefit" onClick={() => benefitsArray.append({ text: "" })} />
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">CTA</span>
          <FieldGrid>
            <TextField label="Label" {...form.register("cta.label")} />
            <TextField label="Href" {...form.register("cta.href")} />
          </FieldGrid>
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
