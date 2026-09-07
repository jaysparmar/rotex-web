"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import {
  TextField,
  TextAreaField,
  SwitchField,
  SelectField,
  RepeaterItem,
  AddButton,
  FieldGrid,
} from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type CategoryOption = { slug: string; name: string };

type ProductCard = {
  id: string;
  published: boolean;
  slug: string;
  name: string;
  description: string;
  image: { src: string; alt: string };
};
type FormValues = {
  enabled: boolean;
  heading: { title: string };
  cta: { label: string; href: string };
  products: ProductCard[];
};

export function ProductsForm({
  initialEnabled,
  initialData,
  categories,
}: {
  initialEnabled: boolean;
  initialData: Omit<FormValues, "enabled">;
  categories: CategoryOption[];
}) {
  const form = useForm<FormValues>({
    defaultValues: { enabled: initialEnabled, ...initialData },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "products" });
  const { pending, error, success, run } = useSaveAction();

  function selectCategory(index: number, slug: string) {
    const category = categories.find((c) => c.slug === slug);
    form.setValue(`products.${index}.slug`, slug);
    form.setValue(`products.${index}.name`, category?.name ?? "");
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(() => saveHomeSection("products", { enabled, data }));
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />

        <TextField label="Heading Title" {...form.register("heading.title")} />
        <FieldGrid>
          <TextField label="CTA Label" {...form.register("cta.label")} />
          <TextField label="CTA Href" {...form.register("cta.href")} />
        </FieldGrid>

        <p className="text-xs text-muted-foreground">
          Cards shown here are product categories, not individual products — pick which category each card
          links to (browsing that category on /products), and give it a short description.
        </p>

        <div className="space-y-4">
          {fields.map((field, i) => (
            <RepeaterItem
              key={field.id}
              title={form.watch(`products.${i}.name`) || `Card ${i + 1}`}
              onRemove={() => remove(i)}
            >
              <SwitchField
                label="Published"
                checked={form.watch(`products.${i}.published`)}
                onCheckedChange={(v) => form.setValue(`products.${i}.published`, v)}
              />
              <SelectField
                label="Category"
                options={categories.map((c) => ({ value: c.slug, label: c.name }))}
                value={form.watch(`products.${i}.slug`)}
                onChange={(e) => selectCategory(i, e.target.value)}
              />
              <TextAreaField
                label="Short Description"
                rows={2}
                {...form.register(`products.${i}.description`)}
              />
              <MediaField name={`products.${i}.image`} mediaType="image" showAlt />
            </RepeaterItem>
          ))}

          <AddButton
            label="Add Card"
            onClick={() =>
              append({
                id: `prod_${Date.now()}`,
                published: true,
                slug: "",
                name: "",
                description: "",
                image: { src: "", alt: "" },
              })
            }
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
