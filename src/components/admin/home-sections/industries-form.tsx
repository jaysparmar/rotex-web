"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { OrderedCheckboxPicker } from "@/components/admin/ordered-checkbox-picker";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type IndustryOption = { id: string; name: string };
type FormValues = {
  enabled: boolean;
  heading: { title: string; subtitle: string };
  industryIds: string[];
};

export function IndustriesForm({
  initialEnabled,
  initialData,
  allIndustries,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string; subtitle: string }; industryIds?: string[] };
  allIndustries: IndustryOption[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      industryIds: initialData.industryIds ?? allIndustries.map((i) => i.id),
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected: string[] = useWatch({ control: form.control, name: "industryIds" }) ?? [];

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("industries", { enabled, data });
        toast.success("Industries section saved");
      } catch (err) {
        toast.error("Failed to save industries section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Title" {...form.register("heading.title")} />
        <TextAreaField label="Heading Subtitle" {...form.register("heading.subtitle")} />

        <OrderedCheckboxPicker
          items={allIndustries.map((i) => ({ id: i.id, label: i.name }))}
          selected={selected}
          onChange={(ids) => form.setValue("industryIds", ids)}
          emptyMessage="No industries yet. Add some on the Industries page first."
        />

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
