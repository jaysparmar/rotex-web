"use client";

import Link from "next/link";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { OrderedCheckboxPicker } from "@/components/admin/ordered-checkbox-picker";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type CategoryOption = { id: string; name: string; slug: string };

type FormValues = {
  enabled: boolean;
  heading: { title: string };
  cta: { label: string; href: string };
  categoryIds: string[];
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
    defaultValues: { enabled: initialEnabled, ...initialData, categoryIds: initialData.categoryIds ?? [] },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected: string[] = useWatch({ control: form.control, name: "categoryIds" }) ?? [];

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
          Cards shown are pulled live from Categories (name, description, image, slug) — pick which ones show
          here and their order. Edit a category&apos;s content at{" "}
          <Link href="/admin/categories" className="underline">
            Admin → Categories
          </Link>
          .
        </p>

        <OrderedCheckboxPicker
          items={categories.map((c) => ({ id: c.id, label: c.name, meta: `/${c.slug}` }))}
          selected={selected}
          onChange={(ids) => form.setValue("categoryIds", ids)}
          emptyMessage="No categories yet. Add some under Admin → Companies first."
        />

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
