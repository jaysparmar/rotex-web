"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type IndustryOption = { id: string; name: string };
type FormValues = {
  enabled: boolean;
  heading: { title: string; subtitle: string };
  industryIds: string[];
};

export function IndustriesForm({
  initialEnabled,
  initialData,
  allIndustries,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string; subtitle: string }; industryIds?: string[] };
  allIndustries: IndustryOption[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      industryIds: initialData.industryIds ?? allIndustries.map((i) => i.id),
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected: string[] = useWatch({ control: form.control, name: "industryIds" }) ?? [];

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("industryIds");
    form.setValue("industryIds", checked ? [...current, id] : current.filter((v) => v !== id));
  }

  function move(id: string, direction: -1 | 1) {
    const current = form.getValues("industryIds");
    const idx = current.indexOf(id);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= current.length) return;
    const next = [...current];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    form.setValue("industryIds", next);
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("industries", { enabled, data });
        toast.success("Industries section saved");
      } catch (err) {
        toast.error("Failed to save industries section");
        throw err;
      }
    });
  }

  const orderedIndustries = [...allIndustries].sort((a, b) => {
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
        <TextAreaField label="Heading Subtitle" {...form.register("heading.subtitle")} />

        <div className="space-y-1 rounded-lg border border-border">
          {allIndustries.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No industries yet. Add some on the Industries page first.
            </p>
          )}
          {orderedIndustries.map((industry) => {
            const checked = selected.includes(industry.id);
            const orderIdx = selected.indexOf(industry.id);
            return (
              <div
                key={industry.id}
                className="flex items-center gap-2.5 border-b border-border p-4 last:border-b-0"
              >
                <label className="flex flex-1 items-center gap-2.5">
                  <Checkbox checked={checked} onCheckedChange={(v) => toggle(industry.id, v === true)} />
                  <span className="text-sm font-medium">{industry.name}</span>
                </label>
                {checked && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={orderIdx === 0}
                      onClick={() => move(industry.id, -1)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={orderIdx === selected.length - 1}
                      onClick={() => move(industry.id, 1)}
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
