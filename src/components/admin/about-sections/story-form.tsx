"use client";

import Image from "next/image";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Partner = { id: string; name: string; logo: string };
type FormValues = {
  enabled: boolean;
  heading: string;
  paragraphs: { text: string }[];
  stats: { value: string; label: string }[];
  trustedLabel: string;
  partnerIds: string[];
  videoSrc: string;
};

export function StoryForm({
  initialEnabled,
  initialData,
  allPartners,
}: {
  initialEnabled: boolean;
  initialData: {
    heading: string;
    paragraphs: string[];
    stats: { value: string; label: string }[];
    trustedLabel: string;
    partnerIds: string[];
    videoSrc: string;
  };
  allPartners: Partner[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      paragraphs: initialData.paragraphs.map((text) => ({ text })),
      stats: initialData.stats,
      trustedLabel: initialData.trustedLabel,
      partnerIds: initialData.partnerIds ?? [],
      videoSrc: initialData.videoSrc,
    },
  });
  const paragraphArray = useFieldArray({ control: form.control, name: "paragraphs" });
  const statsArray = useFieldArray({ control: form.control, name: "stats" });
  const { pending, error, success, run } = useSaveAction();
  const selectedPartners = form.watch("partnerIds");

  function togglePartner(id: string, checked: boolean) {
    const current = form.getValues("partnerIds");
    form.setValue("partnerIds", checked ? [...current, id] : current.filter((p) => p !== id));
  }

  function onSubmit(values: FormValues) {
    const { enabled, paragraphs, ...rest } = values;
    const data = { ...rest, paragraphs: paragraphs.map((p) => p.text) };
    run(async () => {
      try {
        await saveAboutSection("story", { enabled, data });
        toast.success("Story section saved");
      } catch (err) {
        toast.error("Failed to save story section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paragraphs</span>
          {paragraphArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Paragraph ${i + 1}`} onRemove={() => paragraphArray.remove(i)}>
              <TextAreaField label="Text" {...form.register(`paragraphs.${i}.text`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Paragraph" onClick={() => paragraphArray.append({ text: "" })} />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stats</span>
          {statsArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Stat ${i + 1}`} onRemove={() => statsArray.remove(i)}>
              <FieldGrid>
                <TextField label="Value" {...form.register(`stats.${i}.value`)} />
                <TextField label="Label" {...form.register(`stats.${i}.label`)} />
              </FieldGrid>
            </RepeaterItem>
          ))}
          <AddButton label="Add Stat" onClick={() => statsArray.append({ value: "", label: "" })} />
        </div>

        <TextField label="Trusted Label" {...form.register("trustedLabel")} />
        <TextField label="Video Src" {...form.register("videoSrc")} />

        <div className="space-y-1 rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Trusted Partner Logos
          </span>
          {allPartners.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published partners yet. Add some on the Partners page first.
            </p>
          )}
          {allPartners.map((partner) => (
            <div key={partner.id} className="flex items-center gap-4 border-t border-border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {partner.logo && (
                  <Image src={partner.logo} alt={partner.name} width={40} height={40} className="size-full object-contain" unoptimized />
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{partner.name}</span>
              <Switch
                checked={selectedPartners.includes(partner.id)}
                onCheckedChange={(v) => togglePartner(partner.id, v)}
              />
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
