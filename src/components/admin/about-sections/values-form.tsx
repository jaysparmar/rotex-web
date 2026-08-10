"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type ValueItem = { title: string; description: string };
type FormValues = { enabled: boolean; heading: string; subheading: string; values: ValueItem[] };

export function ValuesForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; subheading: string; values: ValueItem[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "values" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("values", { enabled, data });
        toast.success("Values section saved");
      } catch (err) {
        toast.error("Failed to save Values section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />
        <TextAreaField label="Subheading" {...form.register("subheading")} />

        <div className="space-y-3">
          {fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Value ${i + 1}`} onRemove={() => remove(i)}>
              <TextField label="Title" {...form.register(`values.${i}.title`)} />
              <TextAreaField label="Description" {...form.register(`values.${i}.description`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Value" onClick={() => append({ title: "", description: "" })} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
