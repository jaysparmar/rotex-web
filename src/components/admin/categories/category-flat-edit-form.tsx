"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { TextField, TextAreaField, SelectField, FieldGrid, Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { createCategory, updateCategory } from "@/app/admin/(dashboard)/companies/actions";

type CompanyOption = { id: string; name: string };

type FormValues = {
  companyId: string;
  name: string;
  slug: string;
  image: string;
  mobileImage: string;
  description: string;
  order: number;
  importReference: string;
};

type CategoryInput = {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  image: string | null;
  mobileImage: string | null;
  description: string | null;
  order: number;
  importReference: string | null;
};

export function CategoryFlatEditForm({
  companies,
  category,
}: {
  companies: CompanyOption[];
  category?: CategoryInput;
}) {
  const router = useRouter();

  const form = useForm<FormValues>({
    defaultValues: {
      companyId: category?.companyId ?? companies[0]?.id ?? "",
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      image: category?.image ?? "",
      mobileImage: category?.mobileImage ?? "",
      description: category?.description ?? "",
      order: category?.order ?? 0,
      importReference: category?.importReference ?? "",
    },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { companyId, ...data } = values;
    run(async () => {
      if (category) {
        await updateCategory(category.id, data);
      } else {
        const created = await createCategory(companyId, data);
        router.push(`/admin/categories/${created.id}`);
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
            <CardDescription>
              Name, slug, and display order. The slug is what /products?category=&lt;slug&gt; filters by.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectField
              label="Company"
              options={companies.map((c) => ({ value: c.id, label: c.name }))}
              defaultValue={form.getValues("companyId")}
              disabled={Boolean(category)}
              {...form.register("companyId")}
            />
            {category && (
              <p className="-mt-2 text-xs text-muted-foreground">Company can&apos;t be changed after creation.</p>
            )}
            <FieldGrid>
              <TextField label="Name" {...form.register("name")} />
              <TextField label="Slug" {...form.register("slug")} />
            </FieldGrid>
            <FieldGrid>
              <ImageUrlField name="image" label="Image" />
              <ImageUrlField name="mobileImage" label="Image (Mobile)" />
            </FieldGrid>
            <FieldGrid>
              <TextAreaField label="Description" {...form.register("description")} />
              <TextField type="number" label="Order" {...form.register("order", { valueAsNumber: true })} />
            </FieldGrid>
            <FieldGrid>
              <Field label="Import Reference">
                <Input {...form.register("importReference")} className="h-9" />
                <p className="text-xs text-muted-foreground">
                  Optional code used to match this category to a spreadsheet column during bulk product import.
                </p>
              </Field>
            </FieldGrid>
          </CardContent>
        </Card>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
