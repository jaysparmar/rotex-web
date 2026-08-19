"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { TextField, TextAreaField, FieldGrid } from "@/components/admin/form-fields";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { createCategory, updateCategory } from "@/app/admin/(dashboard)/companies/actions";

type FormValues = {
  name: string;
  slug: string;
  image: string;
  mobileImage: string;
  description: string;
  order: number;
};

type CategoryInput = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  mobileImage: string | null;
  description: string | null;
  order: number;
};

export function CategoryEditForm({
  companyId,
  companyName,
  category,
}: {
  companyId: string;
  companyName: string;
  category?: CategoryInput;
}) {
  const router = useRouter();

  const form = useForm<FormValues>({
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      image: category?.image ?? "",
      mobileImage: category?.mobileImage ?? "",
      description: category?.description ?? "",
      order: category?.order ?? 0,
    },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    run(async () => {
      if (category) {
        await updateCategory(category.id, values);
      } else {
        const created = await createCategory(companyId, values);
        router.push(`/admin/companies/${companyId}/categories/${created.id}`);
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Category for {companyName}</CardTitle>
            <CardDescription>Name, slug, and display order used to list this category under {companyName}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
