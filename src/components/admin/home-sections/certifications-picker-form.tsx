"use client";

import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
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

        <div className="space-y-1 rounded-lg border border-border">
          {allCertifications.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published certifications yet. Add some on the Certifications page first.
            </p>
          )}
          {allCertifications.map((certification) => (
            <div key={certification.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {certification.logo && (
                  <Image
                    src={certification.logo}
                    alt={certification.name}
                    width={40}
                    height={40}
                    className="size-full object-contain"
                    unoptimized
                  />
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{certification.name}</span>
              <Switch
                checked={selected.includes(certification.id)}
                onCheckedChange={(v) => toggle(certification.id, v)}
              />
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
