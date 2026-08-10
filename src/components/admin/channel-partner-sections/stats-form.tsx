"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveChannelPartnerSection } from "@/app/admin/(dashboard)/channel-partner/actions";

type Stat = { value: string; label: string };
type FormValues = {
  enabled: boolean;
  stats: Stat[];
  growthHeading: string;
  growthDescription: string;
};

export function ChannelPartnerStatsForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: Omit<FormValues, "enabled">;
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveChannelPartnerSection("stats", { enabled, data });
        toast.success("Stats section saved");
      } catch (err) {
        toast.error("Failed to save Stats section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <p className="text-xs text-muted-foreground">
          The layout splits these into 3 stats, a "Built for Growth" heading block, then 3 more stats — always 6 total.
        </p>

        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-4 rounded-lg border border-border p-4">
              <span className="text-sm font-medium text-muted-foreground">Stat {i + 1}</span>
              <FieldGrid>
                <TextField label="Value" {...form.register(`stats.${i}.value`)} />
                <TextField label="Label" {...form.register(`stats.${i}.label`)} />
              </FieldGrid>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Middle Heading Block</span>
          <TextField label="Heading" {...form.register("growthHeading")} />
          <TextField label="Description" {...form.register("growthDescription")} />
        </div>

        <div className="space-y-3">
          {[3, 4, 5].map((i) => (
            <div key={i} className="space-y-4 rounded-lg border border-border p-4">
              <span className="text-sm font-medium text-muted-foreground">Stat {i + 1}</span>
              <FieldGrid>
                <TextField label="Value" {...form.register(`stats.${i}.value`)} />
                <TextField label="Label" {...form.register(`stats.${i}.label`)} />
              </FieldGrid>
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
