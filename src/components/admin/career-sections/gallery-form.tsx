"use client";

import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, SelectField, AddButton } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveCareerSection } from "@/app/admin/(dashboard)/career/actions";

type Image = { src: string; alt: string; size: "wide" | "narrow" };
type ImageInput = { image: { src: string }; alt: string; size: "wide" | "narrow" };
type FormValues = { enabled: boolean; images: ImageInput[] };

const SIZE_OPTIONS = [
  { value: "wide", label: "Wide" },
  { value: "narrow", label: "Narrow" },
];

export function CareerGalleryForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { images: Image[] };
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      images: initialData.images.map((img) => ({ image: { src: img.src }, alt: img.alt, size: img.size })),
    },
  });
  const imagesArray = useFieldArray({ control: form.control, name: "images" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, images } = values;
    const data = { images: images.map((i) => ({ src: i.image.src, alt: i.alt, size: i.size })) };
    run(async () => {
      try {
        await saveCareerSection("gallery", { enabled, data });
        toast.success("Gallery section saved");
      } catch (err) {
        toast.error("Failed to save Gallery section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />

        <div className="space-y-3">
          {imagesArray.fields.map((field, i) => (
            <ImageRow key={field.id} index={i} onRemove={() => imagesArray.remove(i)} />
          ))}
          <AddButton
            label="Add Image"
            onClick={() => imagesArray.append({ image: { src: "" }, alt: "", size: "wide" })}
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function ImageRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const form = useFormContext<FormValues>();

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Image {index + 1}</span>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
      <MediaField name={`images.${index}.image`} mediaType="image" showAlt={false} />
      <TextField label="Alt Text" {...form.register(`images.${index}.alt`)} />
      <SelectField
        label="Size"
        options={SIZE_OPTIONS}
        defaultValue={form.getValues(`images.${index}.size`)}
        {...form.register(`images.${index}.size`)}
      />
    </div>
  );
}
