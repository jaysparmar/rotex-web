"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveCareerSection } from "@/app/admin/(dashboard)/career/actions";

type Value = { icon: string; title: string; description: string };
type ValueInput = { icon: { src: string }; title: string; description: string };
type FormValues = { enabled: boolean; heading: string; description: string; values: ValueInput[] };

export function CareerValuesForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; description: string; values: Value[] };
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      description: initialData.description,
      values: initialData.values.map((v) => ({ ...v, icon: { src: v.icon } })),
    },
  });
  const valuesArray = useFieldArray({ control: form.control, name: "values" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, values: formValues, ...rest } = values;
    const data = {
      ...rest,
      values: formValues.map((v) => ({ icon: v.icon.src, title: v.title, description: v.description })),
    };
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
          <div className="grid gap-3 sm:grid-cols-2">
            {valuesArray.fields.map((field, i) => (
              <RepeaterItem key={field.id} title={form.watch(`values.${i}.title`) || `Value ${i + 1}`} onRemove={() => valuesArray.remove(i)}>
                <MediaField name={`values.${i}.icon`} mediaType="image" showAlt={false} defaultMode="upload" previewFit="contain" />
                <TextField label="Title" {...form.register(`values.${i}.title`)} />
                <TextAreaField label="Description" {...form.register(`values.${i}.description`)} />
              </RepeaterItem>
            ))}
          </div>
          <AddButton
            label="Add Value"
            onClick={() => valuesArray.append({ icon: { src: "" }, title: "", description: "" })}
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
