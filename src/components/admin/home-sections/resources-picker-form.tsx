"use client";

import { useEffect } from "react";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

// The homepage Resources section's card grid only ever shows this many per tab.
const MAX_RESOURCES = 3;

type Resource = { id: string; type: string; title: string; slug: string; image: string };
type Tab = { id: string; label: string; cta: { label: string; href: string }; resourceIds: string[] };
type FormValues = { enabled: boolean; heading: { title: string }; tabs: Tab[] };

export function ResourcesPickerForm({
  initialEnabled,
  initialData,
  allResources,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string }; tabs: Tab[] };
  allResources: Resource[];
}) {
  const form = useForm<FormValues>({
    defaultValues: { enabled: initialEnabled, ...initialData },
  });
  const { fields } = useFieldArray({ control: form.control, name: "tabs" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("resources", { enabled, data });
        toast.success("Resources section saved");
      } catch (err) {
        toast.error("Failed to save resources section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Title" {...form.register("heading.title")} />

        <div className="space-y-6">
          {fields.map((field, i) => {
            // Tab.id (the resource type, e.g. "case-studies") is the real identifier to
            // filter/display by — NOT `field.id`, which is react-hook-form's own generated
            // array key. Tab data happens to use the field name "id" too, which RHF's
            // useFieldArray silently overwrites in `fields`, so read the real value from
            // the untouched initialData prop instead.
            const typeId = initialData.tabs[i]?.id ?? field.id;
            return (
              <div key={field.id} className="space-y-4 rounded-lg border border-border p-4">
                <span className="text-sm font-semibold">{form.watch(`tabs.${i}.label`)}</span>
                <FieldGrid>
                  <TextField label="Tab Label" {...form.register(`tabs.${i}.label`)} />
                  <TextField label="CTA Label" {...form.register(`tabs.${i}.cta.label`)} />
                </FieldGrid>
                <TextField label="CTA Href" {...form.register(`tabs.${i}.cta.href`)} />

                <ResourcePicker
                  tabIndex={i}
                  typeId={typeId}
                  options={allResources.filter((r) => r.type === typeId)}
                />
              </div>
            );
          })}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function ResourcePicker({
  tabIndex,
  typeId,
  options,
}: {
  tabIndex: number;
  typeId: string;
  options: Resource[];
}) {
  const form = useFormContext<FormValues>();
  const selected = form.watch(`tabs.${tabIndex}.resourceIds`) ?? [];

  // Stale ids (resource deleted/recreated elsewhere, no longer in `options`) can't be
  // unchecked by the admin — they count toward the 3-item cap but render no visible
  // switch to toggle off, locking the picker. Drop them on load so the count reflects
  // what's actually selectable. Also re-applies the pre-existing over-cap trim below.
  useEffect(() => {
    const validIds = new Set(options.map((o) => o.id));
    const cleaned = selected.filter((id) => validIds.has(id)).slice(0, MAX_RESOURCES);
    if (cleaned.length !== selected.length) {
      form.setValue(`tabs.${tabIndex}.resourceIds`, cleaned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string, checked: boolean) {
    const current = form.getValues(`tabs.${tabIndex}.resourceIds`) ?? [];
    form.setValue(
      `tabs.${tabIndex}.resourceIds`,
      checked ? [...current, id] : current.filter((r) => r !== id)
    );
  }

  return (
    <div className="space-y-1 border-t border-border pt-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {typeId.replace("-", " ")}
      </span>
      <ItemPickerGrid
        items={options.map((r) => ({ id: r.id, image: r.image, label: r.title }))}
        selectedIds={selected}
        onToggle={toggle}
        emptyMessage="No published resources of this type yet. Add some on the Resources page first."
        imageFit="cover"
        maxSelected={MAX_RESOURCES}
      />
    </div>
  );
}
