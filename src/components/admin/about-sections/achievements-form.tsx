"use client";

import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

const MAX_AWARDS = 3;

type Award = { id: string; title: string; year: string; image: string };
type CtaButton = { label: string; href: string };
type FormValues = { enabled: boolean; heading: string; awardIds: string[]; cta: CtaButton };

export function AchievementsForm({
  initialEnabled,
  initialData,
  allAwards,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; awardIds: string[]; cta: CtaButton };
  allAwards: Award[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      awardIds: initialData.awardIds ?? [],
      cta: initialData.cta,
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected = form.watch("awardIds");

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("awardIds");
    if (checked && current.length >= MAX_AWARDS) return;
    form.setValue("awardIds", checked ? [...current, id] : current.filter((a) => a !== id));
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("achievements", { enabled, data });
        toast.success("Achievements section saved");
      } catch (err) {
        toast.error("Failed to save Achievements section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />

        <div className="space-y-1 rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Featured Awards ({selected.length}/{MAX_AWARDS} selected)
          </span>
          {allAwards.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published awards yet. Add some on the Awards page first.
            </p>
          )}
          {allAwards.map((award) => {
            const isSelected = selected.includes(award.id);
            const disabled = !isSelected && selected.length >= MAX_AWARDS;
            return (
              <div key={award.id} className="flex items-center gap-4 border-t border-border p-4">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                  {award.image && (
                    <Image src={award.image} alt={award.title} width={48} height={48} className="size-full object-cover" unoptimized />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{award.title}</p>
                  <p className="text-xs text-muted-foreground">{award.year}</p>
                </div>
                <Switch checked={isSelected} disabled={disabled} onCheckedChange={(v) => toggle(award.id, v)} />
              </div>
            );
          })}
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">CTA</span>
          <FieldGrid>
            <TextField label="Label" {...form.register("cta.label")} />
            <TextField label="Href" {...form.register("cta.href")} />
          </FieldGrid>
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
