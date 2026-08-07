"use client";

import { useRef, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, Field } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type CtaButton = { label: string; href: string };
type FormValues = { enabled: boolean; title: string; description: string; image: string; cta: CtaButton };

export function GrowWithRotexForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description: string; image: string; cta: CtaButton };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const image = useWatch({ control: form.control, name: "image" });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) form.setValue("image", json.data.url, { shouldDirty: true });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("grow-with-rotex", { enabled, data });
        toast.success("Grow With Rotex section saved");
      } catch (err) {
        toast.error("Failed to save Grow With Rotex section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <Field label="Image">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="gap-1.5">
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        </Field>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-32 w-full rounded-lg border border-border object-cover" />
        )}

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
