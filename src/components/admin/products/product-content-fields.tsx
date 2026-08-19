"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { TextField, TextAreaField, RepeaterItem, AddButton } from "@/components/admin/form-fields";
import { PillsInput } from "@/components/admin/pills-input";
import { DocumentField } from "@/components/admin/document-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export type ProductContentFormValues = {
  certificates: string[];
  features: string;
  specifications: { key: string; value: string }[];
  downloads: { title: string; description: string; url: { src: string } }[];
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
        </CardHeader>
        <CardContent className="space-y-3">
          {downloads.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Download ${i + 1}`} onRemove={() => downloads.remove(i)}>
              <TextField label="Title" {...form.register(`downloads.${i}.title`)} />
              <TextAreaField label="Description" {...form.register(`downloads.${i}.description`)} />
              <DocumentField name={`downloads.${i}.url`} label="Download File" />
            </RepeaterItem>
          ))}
          <AddButton
            label="Add Download"
            onClick={() => downloads.append({ title: "", description: "", url: { src: "" } })}
          />
        </CardContent>
      </Card>
    </>
  );
}
