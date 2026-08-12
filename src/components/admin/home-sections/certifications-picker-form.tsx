"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type Certification = { id: string; name: string; logo: string };
type FormValues = { enabled: boolean; title: string; description: string; certificationIds: string[] };

export function CertificationsPickerForm({
  initialEnabled,
  initialData,
  allCertifications,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description?: string; certificationIds: string[] };
  allCertifications: Certification[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      title: initialData.title,
      description: initialData.description ?? "",
      certificationIds: initialData.certificationIds ?? [],
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected = form.watch("certificationIds");

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("certificationIds");
    form.setValue(
      "certificationIds",
      checked ? [...current, id] : current.filter((c) => c !== id)
    );
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("certifications", { enabled, data });
        toast.success("Certifications section saved");
      } catch (err) {
        toast.error("Failed to save certifications section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <ItemPickerGrid
          items={allCertifications.map((c) => ({ id: c.id, image: c.logo, label: c.name }))}
          selectedIds={selected}
          onToggle={toggle}
          emptyMessage="No published certifications yet. Add some on the Certifications page first."
        />

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
