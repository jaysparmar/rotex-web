"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, SelectField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveCareerSection } from "@/app/admin/(dashboard)/career/actions";
import { VALUE_ICON_OPTIONS } from "@/lib/career-value-icons";

type Value = { icon: string; title: string; description: string };
type FormValues = { enabled: boolean; heading: string; description: string; values: Value[] };

const ICON_SELECT_OPTIONS = VALUE_ICON_OPTIONS.map((o) => ({ value: o.key, label: o.label }));

export function CareerValuesForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; description: string; values: Value[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const valuesArray = useFieldArray({ control: form.control, name: "values" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveCareerSection("values", { enabled, data });
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
        <TextAreaField label="Description" {...form.register("description")} />

        <div className="space-y-3">
          {valuesArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={form.watch(`values.${i}.title`) || `Value ${i + 1}`} onRemove={() => valuesArray.remove(i)}>
              <SelectField label="Icon" options={ICON_SELECT_OPTIONS} defaultValue={field.icon} {...form.register(`values.${i}.icon`)} />
              <TextField label="Title" {...form.register(`values.${i}.title`)} />
              <TextAreaField label="Description" {...form.register(`values.${i}.description`)} />
            </RepeaterItem>
          ))}
          <AddButton
            label="Add Value"
            onClick={() => valuesArray.append({ icon: VALUE_ICON_OPTIONS[0].key, title: "", description: "" })}
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
