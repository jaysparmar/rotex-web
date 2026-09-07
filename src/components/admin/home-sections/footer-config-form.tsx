"use client";

import { useForm, FormProvider, useFieldArray, useFormContext, useWatch, Controller } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { SaveBar } from "@/components/admin/section-form-shell";
import { Field, TextField, RepeaterItem, AddButton, FieldGrid } from "@/components/admin/form-fields";
import { FooterColumnDialog } from "@/components/admin/home-sections/footer-column-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveGlobalConfig } from "@/app/admin/(dashboard)/home/actions";

type IndustryOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

type FormValues = {
  footer: PrismaJson.GlobalConfigData["footer"];
};

export function FooterConfigForm({
  initialData,
  logo,
  header,
  industries,
  categories,
}: {
  initialData: FormValues;
  logo: PrismaJson.GlobalConfigData["logo"];
  header: PrismaJson.GlobalConfigData["header"];
  industries: IndustryOption[];
  categories: CategoryOption[];
}) {
  const form = useForm<FormValues>({ defaultValues: initialData });
  const { pending, error, success, run } = useSaveAction();

  const columns = useFieldArray({ control: form.control, name: "footer.columns" });
  const social = useFieldArray({ control: form.control, name: "footer.social" });
  const legalLinks = useFieldArray({ control: form.control, name: "footer.legal.links" });

  function onSubmit(values: FormValues) {
    run(() => saveGlobalConfig({ logo, header, footer: values.footer } as never));
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <TextField label="Tagline" {...form.register("footer.tagline")} />

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Columns</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                columns.append({ id: `col_${Date.now()}`, heading: "New Column", enabled: true, links: [], source: null })
              }
            >
              <Plus className="size-3.5" />
              Add Column
            </Button>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border">
            {columns.fields.map((field, i) => (
              <FooterColumnRow
                key={field.id}
                columnIndex={i}
                industries={industries}
                categories={categories}
                onSave={form.handleSubmit(onSubmit)}
                pending={pending}
                onRemove={() => columns.remove(i)}
              />
            ))}
          </div>

          {social.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Social ${i + 1}`} onRemove={() => social.remove(i)}>
              <FieldGrid>
                <Controller
                  control={form.control}
                  name={`footer.social.${i}.platform`}
                  render={({ field }) => (
                    <Field label="Platform">
                      <Select
                        items={Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, p.label]))}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOCIAL_PLATFORMS.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <span className="flex items-center gap-2">
                                <p.icon className="size-3.5" />
                                {p.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <TextField label="Href" {...form.register(`footer.social.${i}.href`)} />
              </FieldGrid>
            </RepeaterItem>
          ))}
          <AddButton
            label="Add Social Link"
            onClick={() =>
              social.append({ id: `soc_${Date.now()}`, platform: SOCIAL_PLATFORMS[0].id, href: "" })
            }
          />

          <TextField label="Legal Copyright" {...form.register("footer.legal.copyright")} />
          {legalLinks.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Legal Link ${i + 1}`} onRemove={() => legalLinks.remove(i)}>
              <FieldGrid>
                <TextField label="Label" {...form.register(`footer.legal.links.${i}.label`)} />
                <TextField label="Href" {...form.register(`footer.legal.links.${i}.href`)} />
              </FieldGrid>
            </RepeaterItem>
          ))}
          <AddButton label="Add Legal Link" onClick={() => legalLinks.append({ label: "", href: "" })} />

          <FieldGrid>
            <TextField label="Contact Email" {...form.register("footer.contact.email")} />
            <TextField label="Contact Phone" {...form.register("footer.contact.phone")} />
          </FieldGrid>
          <TextField label="Contact Address" {...form.register("footer.contact.address")} />
        </section>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function FooterColumnRow({
  columnIndex,
  industries,
  categories,
  onSave,
  pending,
  onRemove,
}: {
  columnIndex: number;
  industries: IndustryOption[];
  categories: CategoryOption[];
  onSave: () => Promise<void>;
  pending: boolean;
  onRemove: () => void;
}) {
  const form = useFormContext();
  const heading = useWatch({ control: form.control, name: `footer.columns.${columnIndex}.heading` });
  const enabled = useWatch({ control: form.control, name: `footer.columns.${columnIndex}.enabled` });
  const sourceType = useWatch({ control: form.control, name: `footer.columns.${columnIndex}.source.type` });

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{heading || "Untitled"}</p>
          {sourceType && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {sourceType} links
            </span>
          )}
        </div>
      </div>
      <Switch
        checked={enabled ?? false}
        onCheckedChange={(v) => form.setValue(`footer.columns.${columnIndex}.enabled`, v)}
      />
      <FooterColumnDialog
        columnIndex={columnIndex}
        industries={industries}
        categories={categories}
        onSave={onSave}
        pending={pending}
        trigger={
          <Button type="button" variant="outline" size="sm">
            <Pencil className="size-3.5" />
          </Button>
        }
      />
      <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
