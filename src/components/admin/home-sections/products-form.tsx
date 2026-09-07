"use client";

import Link from "next/link";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { Checkbox } from "@/components/ui/checkbox";
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

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("categoryIds");
    form.setValue("categoryIds", checked ? [...current, id] : current.filter((v) => v !== id));
  }

  function move(id: string, direction: -1 | 1) {
    const current = form.getValues("categoryIds");
    const idx = current.indexOf(id);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= current.length) return;
    const next = [...current];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    form.setValue("categoryIds", next);
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(() => saveHomeSection("products", { enabled, data }));
  }

  const orderedCategories = [...categories].sort((a, b) => {
    const aChecked = selected.includes(a.id);
    const bChecked = selected.includes(b.id);
    if (aChecked && bChecked) return selected.indexOf(a.id) - selected.indexOf(b.id);
    if (aChecked) return -1;
    if (bChecked) return 1;
    return 0;
  });

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

        <div className="space-y-1 rounded-lg border border-border">
          {categories.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No categories yet. Add some under Admin → Companies first.
            </p>
          )}
          {orderedCategories.map((category) => {
            const checked = selected.includes(category.id);
            const orderIdx = selected.indexOf(category.id);
            return (
              <div key={category.id} className="flex items-center gap-2.5 border-b border-border p-4 last:border-b-0">
                <label className="flex flex-1 items-center gap-2.5">
                  <Checkbox checked={checked} onCheckedChange={(v) => toggle(category.id, v === true)} />
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">/{category.slug}</span>
                </label>
                {checked && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={orderIdx === 0}
                      onClick={() => move(category.id, -1)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={orderIdx === selected.length - 1}
                      onClick={() => move(category.id, 1)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
