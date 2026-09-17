"use client";

import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid, SwitchField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { Textarea } from "@/components/ui/textarea";
import { TitleField, DescriptionField } from "@/components/admin/seo/seo-meta-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveSeoPage } from "@/app/admin/(dashboard)/seo/actions";
import type { SeoMetaData } from "@/lib/seo";

type FormValues = {
  title: string;
  description: string;
  keywords: { value: string }[];
  ogImage: { src: string; alt: string };
  canonical: string;
  noindex: boolean;
  schema: string;
};

function toFormValues(data: SeoMetaData): FormValues {
  return { ...data, keywords: data.keywords.map((value) => ({ value })) };
}

function toSeoMetaData(values: FormValues): SeoMetaData {
  return { ...values, keywords: values.keywords.map((k) => k.value).filter(Boolean) };
}

export function SeoForm({ pageKey, initialData }: { pageKey: string; initialData: SeoMetaData }) {
  const form = useForm<FormValues>({ defaultValues: toFormValues(initialData) });
  const { pending, error, success, run } = useSaveAction();
  const keywords = useFieldArray({ control: form.control, name: "keywords" });
  const [schemaError, setSchemaError] = useState<string>();

  function onSubmit(values: FormValues) {
    const trimmedSchema = values.schema.trim();
    if (trimmedSchema) {
      try {
        JSON.parse(trimmedSchema);
      } catch {
        setSchemaError("Schema must be valid JSON.");
        return;
      }
    }
    setSchemaError(undefined);
    run(() => saveSeoPage(pageKey, toSeoMetaData(values)));
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TitleField name="title" />
        <DescriptionField name="description" />

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Keywords</span>
          {keywords.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Keyword ${i + 1}`} onRemove={() => keywords.remove(i)}>
              <TextField label="Keyword" {...form.register(`keywords.${i}.value`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Keyword" onClick={() => keywords.append({ value: "" })} />
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Open Graph Image</span>
          <MediaField name="ogImage" mediaType="image" />
        </div>

        <FieldGrid>
          <TextField label="Canonical URL" {...form.register("canonical")} />
        </FieldGrid>

        <SwitchField
          label="Noindex (hide this page from search engines)"
          checked={form.watch("noindex")}
          onCheckedChange={(v) => form.setValue("noindex", v)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Schema (JSON-LD)
          </label>
          <Textarea rows={8} className="font-mono text-xs" {...form.register("schema")} />
          {schemaError && <p className="text-xs text-destructive">{schemaError}</p>}
          <p className="text-xs text-muted-foreground">
            Optional. Paste raw JSON-LD structured data (e.g. Organization, WebPage). Must be valid JSON.
          </p>
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
