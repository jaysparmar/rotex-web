"use client";

import { useRef, useState } from "react";
import { useForm, FormProvider, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type GalleryImage = { src: string; alt: string };
type FormValues = { enabled: boolean; images: GalleryImage[] };

export function GalleryForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { images: GalleryImage[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "images" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("gallery", { enabled, data });
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
          {fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Image ${i + 1}`} onRemove={() => remove(i)}>
              <GalleryImageRow index={i} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Image" onClick={() => append({ src: "", alt: "" })} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function GalleryImageRow({ index }: { index: number }) {
  const form = useFormContext<FormValues>();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const src = useWatch({ control: form.control, name: `images.${index}.src` });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) form.setValue(`images.${index}.src`, json.data.url, { shouldDirty: true });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="gap-1.5">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Uploading..." : "Choose File"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-32 w-full rounded-lg border border-border object-cover" />
      )}
      <TextField label="Alt Text" {...form.register(`images.${index}.alt`)} />
    </div>
  );
}
