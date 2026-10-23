"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid, SwitchField } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { KeywordChipsInput } from "@/components/admin/seo/keyword-chips-input";
import { Textarea } from "@/components/ui/textarea";
import { TitleField, DescriptionField } from "@/components/admin/seo/seo-meta-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveSeoPage } from "@/app/admin/(dashboard)/seo/actions";
import type { SeoMetaData } from "@/lib/seo";

type FormValues = SeoMetaData;

export function SeoForm({ pageKey, initialData }: { pageKey: string; initialData: SeoMetaData }) {
  const form = useForm<FormValues>({ defaultValues: initialData });
  const { pending, error, success, run } = useSaveAction();
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
    run(() => saveSeoPage(pageKey, values));
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TitleField name="title" />
        <DescriptionField name="description" />

        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Keywords</span>
          <KeywordChipsInput value={form.watch("keywords")} onChange={(kw) => form.setValue("keywords", kw)} />
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
