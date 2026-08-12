"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField } from "@/components/admin/form-fields";
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type Partner = { id: string; name: string; logo: string };
type FormValues = { enabled: boolean; title: string; partnerIds: string[] };

export function PartnersPickerForm({
  initialEnabled,
  initialData,
  allPartners,
}: {
  initialEnabled: boolean;
  initialData: { title: string; partnerIds: string[] };
  allPartners: Partner[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      title: initialData.title,
      partnerIds: initialData.partnerIds ?? [],
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected = form.watch("partnerIds");

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("partnerIds");
    form.setValue(
      "partnerIds",
      checked ? [...current, id] : current.filter((p) => p !== id)
    );
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("partners", { enabled, data });
        toast.success("Partners section saved");
      } catch (err) {
        toast.error("Failed to save partners section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />

        <ItemPickerGrid
          items={allPartners.map((p) => ({ id: p.id, image: p.logo, label: p.name }))}
          selectedIds={selected}
          onToggle={toggle}
          emptyMessage="No published partners yet. Add some on the Partners page first."
        />

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
