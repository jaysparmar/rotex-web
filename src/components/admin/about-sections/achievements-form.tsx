"use client";

import { useForm, FormProvider, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, SelectField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Badge = "rail" | "zed" | "trophy";
type Achievement = { badge: Badge; text: string };
type CtaButton = { label: string; href: string };
type FormValues = { enabled: boolean; heading: string; achievements: Achievement[]; cta: CtaButton };

const BADGE_OPTIONS = [
  { value: "rail", label: "Rail Analysis Innovation" },
  { value: "zed", label: "ZED Bronze" },
  { value: "trophy", label: "Trophy" },
];

export function AchievementsForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; achievements: Achievement[]; cta: CtaButton };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "achievements" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("achievements", { enabled, data });
        toast.success("Achievements section saved");
      } catch (err) {
        toast.error("Failed to save Achievements section");
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
            <RepeaterItem key={field.id} title={`Achievement ${i + 1}`} onRemove={() => remove(i)}>
              <Controller
                control={form.control}
                name={`achievements.${i}.badge`}
                render={({ field: f }) => (
                  <SelectField label="Badge" options={BADGE_OPTIONS} value={f.value} onChange={(e) => f.onChange(e.target.value)} />
                )}
              />
              <TextAreaField label="Text" {...form.register(`achievements.${i}.text`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Achievement" onClick={() => append({ badge: "trophy", text: "" })} />
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
