"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { TextField, TextAreaField, RepeaterItem, AddButton, SelectField } from "@/components/admin/form-fields";
import { CertificatesSelect } from "@/components/admin/certificates-select";
import { DocumentField } from "@/components/admin/document-field";
import { RichTextField } from "@/components/admin/rich-text-field";
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
    categoryId: string;
    tab: string;
  }[];
};

export function ProductContentFields({
  downloadCategories,
  certificationOptions,
  showDescription = true,
}: {
  downloadCategories: { id: string; name: string }[];
  certificationOptions: string[];
  showDescription?: boolean;
}) {
  const form = useFormContext<ProductContentFormValues>();
  const specs = useFieldArray({ control: form.control, name: "specifications" });
  const downloads = useFieldArray({ control: form.control, name: "downloads" });
  const downloadErrors = form.formState.errors.downloads;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CertificatesSelect name="certificates" label="Certificates" options={certificationOptions} />
        </CardContent>
      </Card>

      {showDescription && (
        <Card>
          <CardHeader>
            <CardTitle>Short Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RichTextField name="description" label="Short Description" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RichTextField name="features" label="Features" />
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
            Every file here also lists on the public /downloads library, under the chosen category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {downloads.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Download ${i + 1}`} onRemove={() => downloads.remove(i)}>
              <SelectField
                label="Category"
                options={downloadCategories.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Choose category..."
                defaultValue={field.categoryId}
                {...form.register(`downloads.${i}.categoryId`, { required: true })}
              />
              {downloadErrors?.[i]?.categoryId && (
                <p className="text-sm text-destructive">Category is required.</p>
              )}
              <TextField label="Title" {...form.register(`downloads.${i}.title`)} />
              <TextAreaField label="Description" {...form.register(`downloads.${i}.description`)} />
              <DocumentField name={`downloads.${i}.url`} label="Download File" />
              <SelectField
                label="Downloads Page Category"
                options={DOWNLOAD_TABS.map((t) => ({ value: t.id, label: t.label }))}
                value={form.watch(`downloads.${i}.tab`) || DOWNLOAD_TABS[0].id}
                onChange={(e) => form.setValue(`downloads.${i}.tab`, e.target.value)}
              />
            </RepeaterItem>
          ))}
          <AddButton
            label="Add Download"
            onClick={() =>
              downloads.append({
                title: "",
                description: "",
                url: { src: "" },
                categoryId: "",
                tab: DOWNLOAD_TABS[0].id,
              })
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
