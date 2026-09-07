"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { TextField, TextAreaField, RepeaterItem, AddButton, SelectField, SwitchField } from "@/components/admin/form-fields";
import { PillsInput } from "@/components/admin/pills-input";
import { DocumentField } from "@/components/admin/document-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DOWNLOAD_TABS } from "@/lib/downloads-data";

export type ProductContentFormValues = {
  certificates: string[];
  features: string;
  description: string;
  specifications: { key: string; value: string }[];
  downloads: {
    title: string;
    description: string;
    url: { src: string };
    tab: string;
    showOnDownloadsPage: boolean;
  }[];
};

export function ProductContentFields() {
  const form = useFormContext<ProductContentFormValues>();
  const specs = useFieldArray({ control: form.control, name: "specifications" });
  const downloads = useFieldArray({ control: form.control, name: "downloads" });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Certificates & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PillsInput name="certificates" label="Certificates" />
          <TextAreaField label="Description" rows={4} {...form.register("description")} />
          <TextAreaField label="Features" rows={4} {...form.register("features")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
          <CardDescription>Optional key/value pairs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {specs.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Spec ${i + 1}`} onRemove={() => specs.remove(i)}>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Key" {...form.register(`specifications.${i}.key`)} />
                <TextField label="Value" {...form.register(`specifications.${i}.value`)} />
              </div>
            </RepeaterItem>
          ))}
          <AddButton label="Add Specification" onClick={() => specs.append({ key: "", value: "" })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Downloads</CardTitle>
          <CardDescription>
            Toggle &quot;Show on Downloads page&quot; to also list a file on the public /downloads library, under the
            chosen category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {downloads.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Download ${i + 1}`} onRemove={() => downloads.remove(i)}>
              <TextField label="Title" {...form.register(`downloads.${i}.title`)} />
              <TextAreaField label="Description" {...form.register(`downloads.${i}.description`)} />
              <DocumentField name={`downloads.${i}.url`} label="Download File" />
              <SwitchField
                label="Show on Downloads page"
                checked={form.watch(`downloads.${i}.showOnDownloadsPage`)}
                onCheckedChange={(v) => form.setValue(`downloads.${i}.showOnDownloadsPage`, v)}
              />
              {form.watch(`downloads.${i}.showOnDownloadsPage`) && (
                <SelectField
                  label="Downloads Page Category"
                  options={DOWNLOAD_TABS.map((t) => ({ value: t.id, label: t.label }))}
                  value={form.watch(`downloads.${i}.tab`) || DOWNLOAD_TABS[0].id}
                  onChange={(e) => form.setValue(`downloads.${i}.tab`, e.target.value)}
                />
              )}
            </RepeaterItem>
          ))}
          <AddButton
            label="Add Download"
            onClick={() =>
              downloads.append({
                title: "",
                description: "",
                url: { src: "" },
                tab: DOWNLOAD_TABS[0].id,
                showOnDownloadsPage: false,
              })
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
