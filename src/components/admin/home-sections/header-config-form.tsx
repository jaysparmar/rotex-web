"use client";

import { useForm, FormProvider, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Pencil, GripVertical } from "lucide-react";
import { SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NavItemDialog } from "@/components/admin/home-sections/nav-item-dialog";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveGlobalConfig } from "@/app/admin/(dashboard)/home/actions";

type IndustryOption = { id: string; name: string; subIndustries: { id: string; name: string }[] };
type BlogOption = { slug: string; title: string };

type FormValues = {
  logo: { src: string; alt: string; href: string };
  header: { nav: PrismaJson.NavItem[]; cta: { label: string; href: string } };
};

export function HeaderConfigForm({
  initialData,
  footer,
  industries,
  productCategories,
  blogs,
}: {
  initialData: FormValues;
  footer: PrismaJson.GlobalConfigData["footer"];
  industries: IndustryOption[];
  productCategories: string[];
  blogs: BlogOption[];
}) {
  const form = useForm<FormValues>({ defaultValues: initialData });
  const { pending, error, success, run } = useSaveAction();
  const nav = useFieldArray({ control: form.control, name: "header.nav" });

  function onSubmit(values: FormValues) {
    run(() => saveGlobalConfig({ logo: values.logo, header: values.header, footer } as never));
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Logo</h2>
          <MediaField name="logo" mediaType="image" />
          <TextField label="Href" {...form.register("logo.href")} />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Navigation</h2>
          <p className="text-xs text-muted-foreground">
            Nav items and their links are fixed to the site&apos;s pages. Toggle visibility and configure each
            item&apos;s mega menu below.
          </p>

          <div className="divide-y divide-border rounded-lg border border-border">
            {nav.fields.map((field, i) => (
              <NavItemRow
                key={field.id}
                navIndex={i}
                industries={industries}
                productCategories={productCategories}
                blogs={blogs}
                onSave={form.handleSubmit(onSubmit)}
                pending={pending}
              />
            ))}
          </div>

          <FieldGrid>
            <TextField label="Header CTA Label" {...form.register("header.cta.label")} />
            <TextField label="Header CTA Href" {...form.register("header.cta.href")} />
          </FieldGrid>
        </section>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function NavItemRow({
  navIndex,
  industries,
  productCategories,
  blogs,
  onSave,
  pending,
}: {
  navIndex: number;
  industries: IndustryOption[];
  productCategories: string[];
  blogs: BlogOption[];
  onSave: () => Promise<void>;
  pending: boolean;
}) {
  const form = useFormContext();
  const label = useWatch({ control: form.control, name: `header.nav.${navIndex}.label` });
  const href = useWatch({ control: form.control, name: `header.nav.${navIndex}.href` });
  const enabled = useWatch({ control: form.control, name: `header.nav.${navIndex}.enabled` });
  const menuType = useWatch({ control: form.control, name: `header.nav.${navIndex}.megaMenu.type` });
  const sourceType = useWatch({ control: form.control, name: `header.nav.${navIndex}.megaMenuSource.type` });

  return (
    <div className="flex items-center gap-4 p-4">
      <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{label || "Untitled"}</p>
          {(menuType || sourceType) && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {sourceType ? `${sourceType} menu` : menuType}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{href}</p>
      </div>
      <Switch checked={enabled ?? false} onCheckedChange={(v) => form.setValue(`header.nav.${navIndex}.enabled`, v)} />
      <NavItemDialog
        navIndex={navIndex}
        industries={industries}
        productCategories={productCategories}
        blogs={blogs}
        onSave={onSave}
        pending={pending}
        trigger={
          <Button type="button" variant="outline" size="sm">
            <Pencil className="size-3.5" />
          </Button>
        }
      />
    </div>
  );
}
