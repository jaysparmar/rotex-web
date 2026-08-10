"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Milestone = { year: string; title: string; description: string };
type FormValues = { enabled: boolean; heading: string; milestones: Milestone[] };

export function JourneyForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; milestones: Milestone[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "milestones" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("journey", { enabled, data });
        toast.success("Journey section saved");
      } catch (err) {
        toast.error("Failed to save Journey section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />

        <div className="space-y-3">
          {fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Milestone ${i + 1}`} onRemove={() => remove(i)}>
              <FieldGrid>
                <TextField label="Year" {...form.register(`milestones.${i}.year`)} />
                <TextField label="Title" {...form.register(`milestones.${i}.title`)} />
              </FieldGrid>
              <TextAreaField label="Description" {...form.register(`milestones.${i}.description`)} />
            </RepeaterItem>
          ))}
          <AddButton
            label="Add Milestone"
            onClick={() => append({ year: "", title: "", description: "" })}
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
