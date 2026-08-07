"use client";

import Image from "next/image";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Resource = { id: string; type: string; title: string; slug: string; image: string };
type Tab = { id: string; label: string; cta: { label: string; href: string }; resourceIds: string[] };
type FormValues = { enabled: boolean; heading: { title: string }; tabs: Tab[] };

export function ResourcesForm({
  initialEnabled,
  initialData,
  allResources,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string }; tabs: Tab[] };
  allResources: Resource[];
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields } = useFieldArray({ control: form.control, name: "tabs" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("resources", { enabled, data });
        toast.success("Resources section saved");
      } catch (err) {
        toast.error("Failed to save Resources section");
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
          {fields.map((field, i) => (
            <div key={field.id} className="space-y-4 rounded-lg border border-border p-4">
              <span className="text-sm font-semibold">{form.watch(`tabs.${i}.label`)}</span>
              <FieldGrid>
                <TextField label="Tab Label" {...form.register(`tabs.${i}.label`)} />
                <TextField label="CTA Label" {...form.register(`tabs.${i}.cta.label`)} />
              </FieldGrid>
              <TextField label="CTA Href" {...form.register(`tabs.${i}.cta.href`)} />

              <ResourcePicker tabIndex={i} typeId={field.id} options={allResources.filter((r) => r.type === field.id)} />
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function ResourcePicker({ tabIndex, typeId, options }: { tabIndex: number; typeId: string; options: Resource[] }) {
  const form = useFormContext<FormValues>();
  const selected = form.watch(`tabs.${tabIndex}.resourceIds`) ?? [];

  function toggle(id: string, checked: boolean) {
    const current = form.getValues(`tabs.${tabIndex}.resourceIds`) ?? [];
    form.setValue(`tabs.${tabIndex}.resourceIds`, checked ? [...current, id] : current.filter((r) => r !== id));
  }

  return (
    <div className="space-y-1 border-t border-border pt-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{typeId.replace("-", " ")}</span>
      <div className="rounded-lg border border-border">
        {options.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No published resources of this type yet. Add some on the Resources page first.</p>
        )}
        {options.map((resource) => (
          <div key={resource.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {resource.image && (
                <Image src={resource.image} alt={resource.title} width={40} height={40} className="size-full object-cover" unoptimized />
              )}
            </div>
            <span className="flex-1 truncate text-sm font-medium">{resource.title}</span>
            <Switch checked={selected.includes(resource.id)} onCheckedChange={(v) => toggle(resource.id, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}
