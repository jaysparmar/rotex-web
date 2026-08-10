"use client";

import { useFormContext } from "react-hook-form";
import { TextField, TextAreaField, SelectField, FieldGrid } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import type { ProductInput } from "@/app/admin/(dashboard)/products/actions";

export const PRODUCT_CATEGORIES = [
  "Solenoid Valve",
  "Angle Seat Valve",
  "Actuators",
  "Positioners",
  "Automotive Solutions",
];

export type EditableProduct = {
  id: string;
  name: string;
  code: string;
  category: string;
  image: string;
  tags: string[];
  subType: string | null;
  operatingType: string | null;
  actionType: string | null;
  portConnections: number | null;
  bodyMaterial: string | null;
  sealMaterial: string | null;
  description: string | null;
  remark: string | null;
};

export type ProductFormValues = {
  name: string;
  code: string;
  category: string;
  image: { src: string };
  tags: string;
  subType: string;
  operatingType: string;
  actionType: string;
  portConnections: string;
  bodyMaterial: string;
  sealMaterial: string;
  description: string;
  remark: string;
};

export function productToFormValues(product?: EditableProduct): ProductFormValues {
  return {
    name: product?.name ?? "",
    code: product?.code ?? "",
    category: product?.category ?? PRODUCT_CATEGORIES[0],
    image: { src: product?.image ?? "" },
    tags: product?.tags.join(", ") ?? "",
    subType: product?.subType ?? "",
    operatingType: product?.operatingType ?? "",
    actionType: product?.actionType ?? "",
    portConnections: product?.portConnections?.toString() ?? "",
    bodyMaterial: product?.bodyMaterial ?? "",
    sealMaterial: product?.sealMaterial ?? "",
    description: product?.description ?? "",
    remark: product?.remark ?? "",
  };
}

export function formValuesToProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    category: values.category,
    image: values.image.src,
    tags: values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    subType: values.subType.trim() || null,
    operatingType: values.operatingType.trim() || null,
    actionType: values.actionType.trim() || null,
    portConnections: values.portConnections.trim() ? Number(values.portConnections) : null,
    bodyMaterial: values.bodyMaterial.trim() || null,
    sealMaterial: values.sealMaterial.trim() || null,
    description: values.description.trim() || null,
    remark: values.remark.trim() || null,
  };
}

export function ProductFormFields() {
  const form = useFormContext<ProductFormValues>();

  return (
    <>
      <FieldGrid>
        <TextField label="Name" {...form.register("name", { required: true })} />
        <TextField label="Model Code" {...form.register("code", { required: true })} />
      </FieldGrid>

      <FieldGrid>
        <SelectField
          label="Category"
          options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          defaultValue={form.getValues("category")}
          {...form.register("category", { required: true })}
        />
        <TextField label="Tags (comma separated)" {...form.register("tags")} />
      </FieldGrid>

      <MediaField name="image" mediaType="image" showAlt={false} />

      <FieldGrid>
        <TextField label="Sub Type" {...form.register("subType")} />
        <TextField label="Operating Type" {...form.register("operatingType")} />
      </FieldGrid>

      <FieldGrid>
        <TextField label="Action Type" {...form.register("actionType")} />
        <TextField label="Port Connections" type="number" {...form.register("portConnections")} />
      </FieldGrid>

      <FieldGrid>
        <TextField label="Body Material" {...form.register("bodyMaterial")} />
        <TextField label="Seal Material" {...form.register("sealMaterial")} />
      </FieldGrid>

      <TextAreaField label="Description" {...form.register("description")} />
      <TextAreaField label="Remark" {...form.register("remark")} />
    </>
  );
}
