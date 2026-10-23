"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { TextField, SwitchField } from "@/components/admin/form-fields";
import { Textarea } from "@/components/ui/textarea";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveGlobalConfig } from "@/app/admin/(dashboard)/home/actions";

type FormValues = { enabled: boolean; title: string; message: string };

const DEFAULTS: FormValues = {
  enabled: false,
  title: "We'll be right back",
  message: "Rotex is undergoing scheduled maintenance. Please check back shortly.",
};

export function MaintenanceConfigForm({ config }: { config: PrismaJson.GlobalConfigData }) {
  const form = useForm<FormValues>({
    defaultValues: { ...DEFAULTS, ...config.maintenance },
  });
  const { pending, error, success, run } = useSaveAction();
  const enabled = form.watch("enabled");

  function onSubmit(values: FormValues) {
    run(async () => {
      try {
        await saveGlobalConfig({ ...config, maintenance: values });
        toast.success("Maintenance settings saved");
      } catch (err) {
        toast.error("Failed to save maintenance settings");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <div className="space-y-1.5">
          <SwitchField
            label="Put the site in maintenance mode"
            checked={enabled}
            onCheckedChange={(v) => form.setValue("enabled", v)}
          />
          <p className="text-xs text-muted-foreground">
            Every public page shows the message below instead of its normal content. The admin panel keeps working so
            you can turn this back off.
          </p>
        </div>

        {enabled && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            Maintenance mode is ON for this setting — save to take the live site down.
          </div>
        )}

        <TextField label="Title" {...form.register("title")} />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</label>
          <Textarea rows={4} {...form.register("message")} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
