"use client";

import { useForm, FormProvider, useFieldArray, useFormContext, useWatch, Controller } from "react-hook-form";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { Field, TextField, TextAreaField, SwitchField, AddButton, FieldGrid } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { FlatImageField } from "@/components/admin/flat-image-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";

type CtaButton = { label: string; href: string };
type Slide = {
  id: string;
  published: boolean;
  title: string;
  description: string;
  media: { type: "image" | "video"; src: string; alt?: string; mobileSrc?: string };
  cta_buttons: CtaButton[];
};
type FormValues = { enabled: boolean; slides: Slide[] };

export function HeroForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { slides: Slide[] };
}) {
  const form = useForm<FormValues>({
    defaultValues: { enabled: initialEnabled, slides: initialData.slides },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "slides" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(() => saveHomeSection("hero", { enabled, data }));
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />

        <div className="space-y-4">
          {fields.map((field, i) => (
            <SlideCard key={field.id} slideIndex={i} onRemove={() => remove(i)} />
          ))}

          <AddButton
            label="Add Slide"
            onClick={() =>
              append({
                id: `slide_${Date.now()}`,
                published: true,
                title: "",
                description: "",
                media: { type: "image", src: "", alt: "", mobileSrc: "" },
                cta_buttons: [],
              })
            }
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function SlideCard({ slideIndex, onRemove }: { slideIndex: number; onRemove: () => void }) {
  const form = useFormContextTyped();
  const title = useWatch({ control: form.control, name: `slides.${slideIndex}.title` });
  const mediaType = useWatch({ control: form.control, name: `slides.${slideIndex}.media.type` });

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GripVertical className="size-4 text-muted-foreground" />
          Slide {slideIndex + 1}
          {title && <span className="text-muted-foreground">— {title}</span>}
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>

      <div className="space-y-4 p-4">
        <SwitchField
          label="Published"
          checked={form.watch(`slides.${slideIndex}.published`)}
          onCheckedChange={(v) => form.setValue(`slides.${slideIndex}.published`, v)}
        />
        <TextField label="Title" {...form.register(`slides.${slideIndex}.title`)} />
        <TextAreaField label="Description" {...form.register(`slides.${slideIndex}.description`)} />

        <div className="space-y-3 rounded-lg bg-muted/20 p-3">
          <Controller
            control={form.control}
            name={`slides.${slideIndex}.media.type`}
            render={({ field }) => (
              <Field label="Media Type">
                <Select
                  items={{ video: "Video", image: "Image" }}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <MediaField name={`slides.${slideIndex}.media`} mediaType={mediaType ?? "image"} />
          {mediaType === "image" && (
            <FlatImageField
              name={`slides.${slideIndex}.media.mobileSrc`}
              label="Mobile Image (optional, falls back to image above)"
            />
          )}
        </div>

        <CtaButtonsRepeater slideIndex={slideIndex} />
      </div>
    </div>
  );
}

function CtaButtonsRepeater({ slideIndex }: { slideIndex: number }) {
  const { control, register } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `slides.${slideIndex}.cta_buttons`,
  });

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">CTA Buttons</span>
      {fields.map((field, j) => (
        <div key={field.id} className="flex items-end gap-2">
          <FieldGrid>
            <TextField label="Label" {...register(`slides.${slideIndex}.cta_buttons.${j}.label`)} />
            <TextField label="Href" {...register(`slides.${slideIndex}.cta_buttons.${j}.href`)} />
          </FieldGrid>
          <RepeaterRemoveButton onClick={() => remove(j)} />
        </div>
      ))}
      <AddButton label="Add Button" onClick={() => append({ label: "", href: "" })} />
    </div>
  );
}

function useFormContextTyped() {
  return useFormContext<FormValues>();
}

function RepeaterRemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={onClick} className="mb-1">
      <Trash2 className="size-3.5 text-destructive" />
    </Button>
  );
}
