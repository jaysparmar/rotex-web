"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveCareerSection } from "@/app/admin/(dashboard)/career/actions";

type FormValues = {
  enabled: boolean;
  heading: string;
  description: string;
  benefits: { text: string }[];
  experienceOptions: string;
};

export function CareerFormSectionForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; description: string; benefits: string[]; experienceOptions: string[] };
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      description: initialData.description,
      benefits: initialData.benefits.map((text) => ({ text })),
      experienceOptions: (initialData.experienceOptions ?? []).join(", "),
    },
  });
  const benefitsArray = useFieldArray({ control: form.control, name: "benefits" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, benefits, experienceOptions, ...rest } = values;
    const data = {
      ...rest,
      benefits: benefits.map((b) => b.text),
      experienceOptions: experienceOptions.split(",").map((v) => v.trim()).filter(Boolean),
    };
    run(async () => {
      try {
        await saveCareerSection("form", { enabled, data });
        toast.success("Application Form section saved");
      } catch (err) {
        toast.error("Failed to save Application Form section");
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
        <TextField label="Experience options (comma separated)" {...form.register("experienceOptions")} />

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Benefits list</span>
          {benefitsArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Benefit ${i + 1}`} onRemove={() => benefitsArray.remove(i)}>
              <TextField label="Text" {...form.register(`benefits.${i}.text`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Benefit" onClick={() => benefitsArray.append({ text: "" })} />
        </div>

        <p className="text-xs text-muted-foreground">
          The Position/Experience/Location dropdowns pull live from Job Postings automatically.
        </p>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
