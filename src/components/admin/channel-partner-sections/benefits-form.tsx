"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, SelectField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveChannelPartnerSection } from "@/app/admin/(dashboard)/channel-partner/actions";
import { BENEFIT_ICON_OPTIONS } from "@/components/sections/channel-partner-benefit-icons";

type Benefit = { icon: string; text: string };
type FormValues = { enabled: boolean; heading: string; benefits: Benefit[] };

const ICON_SELECT_OPTIONS = BENEFIT_ICON_OPTIONS.map((o) => ({ value: o.key, label: o.label }));

export function ChannelPartnerBenefitsForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; benefits: Benefit[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const benefitsArray = useFieldArray({ control: form.control, name: "benefits" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveChannelPartnerSection("benefits", { enabled, data });
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

        <div className="space-y-3">
          {benefitsArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Benefit ${i + 1}`} onRemove={() => benefitsArray.remove(i)}>
              <SelectField label="Icon" options={ICON_SELECT_OPTIONS} defaultValue={field.icon} {...form.register(`benefits.${i}.icon`)} />
              <TextField label="Text" {...form.register(`benefits.${i}.text`)} />
            </RepeaterItem>
          ))}
          <AddButton
            label="Add Benefit"
            onClick={() => benefitsArray.append({ icon: BENEFIT_ICON_OPTIONS[0].key, text: "" })}
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
