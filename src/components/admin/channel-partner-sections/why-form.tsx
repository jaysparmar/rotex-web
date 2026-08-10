"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveChannelPartnerSection } from "@/app/admin/(dashboard)/channel-partner/actions";

type CardInput = { title: string; pointsText: string };
type FormValues = { enabled: boolean; heading: string; description: string; cards: CardInput[] };
type WhyCard = { title: string; points: string[] };

export function ChannelPartnerWhyForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; description: string; cards: WhyCard[] };
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      description: initialData.description,
      cards: initialData.cards.map((c) => ({ title: c.title, pointsText: c.points.join("\n") })),
    },
  });
  const cardsArray = useFieldArray({ control: form.control, name: "cards" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, cards, ...rest } = values;
    const data = {
      ...rest,
      cards: cards.map((c) => ({
        title: c.title,
        points: c.pointsText.split("\n").map((p) => p.trim()).filter(Boolean),
      })),
    };
    run(async () => {
      try {
        await saveChannelPartnerSection("why", { enabled, data });
        toast.success("Why section saved");
      } catch (err) {
        toast.error("Failed to save Why section");
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
          {cardsArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={form.watch(`cards.${i}.title`) || `Card ${i + 1}`} onRemove={() => cardsArray.remove(i)}>
              <TextField label="Card Title" {...form.register(`cards.${i}.title`)} />
              <TextAreaField label="Points (one per line)" rows={4} {...form.register(`cards.${i}.pointsText`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Card" onClick={() => cardsArray.append({ title: "", pointsText: "" })} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
