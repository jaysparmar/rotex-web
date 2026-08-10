"use client";

import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, AddButton } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveCareerSection } from "@/app/admin/(dashboard)/career/actions";

type Card = { title: string; description: string; image?: string };
type CardInput = { title: string; description: string; image: { src: string } };
type FormValues = { enabled: boolean; heading: string; description: string; cards: CardInput[] };

export function CareerWhyForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; description: string; cards: Card[] };
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      description: initialData.description,
      cards: initialData.cards.map((c) => ({ title: c.title, description: c.description, image: { src: c.image ?? "" } })),
    },
  });
  const cardsArray = useFieldArray({ control: form.control, name: "cards" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, cards, ...rest } = values;
    const data = { ...rest, cards: cards.map((c) => ({ title: c.title, description: c.description, image: c.image.src })) };
    run(async () => {
      try {
        await saveCareerSection("why", { enabled, data });
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
          <div className="grid gap-3 sm:grid-cols-2">
            {cardsArray.fields.map((field, i) => (
              <CardRow key={field.id} index={i} onRemove={() => cardsArray.remove(i)} />
            ))}
          </div>
          <AddButton
            label="Add Card"
            onClick={() => cardsArray.append({ title: "", description: "", image: { src: "" } })}
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function CardRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const form = useFormContext<FormValues>();

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Card {index + 1}</span>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
      <TextField label="Title" {...form.register(`cards.${index}.title`)} />
      <TextAreaField label="Description" {...form.register(`cards.${index}.description`)} />
      <MediaField name={`cards.${index}.image`} mediaType="image" showAlt={false} previewFit="contain" />
    </div>
  );
}
