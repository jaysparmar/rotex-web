"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { TextField, SwitchField } from "@/components/admin/form-fields";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveGlobalConfig } from "@/app/admin/(dashboard)/home/actions";

type FormValues = { enabled: boolean; iframeUrl: string; label: string };

export function AskAiConfigForm({ config }: { config: PrismaJson.GlobalConfigData }) {
  const form = useForm<FormValues>({
    defaultValues: config.askAi ?? { enabled: false, iframeUrl: "", label: "" },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    run(async () => {
      try {
        await saveGlobalConfig({ ...config, askAi: values });
        toast.success("Ask AI button saved");
      } catch (err) {
        toast.error("Failed to save Ask AI button");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <SwitchField
          label="Show floating Ask AI button"
          checked={form.watch("enabled")}
          onCheckedChange={(v) => form.setValue("enabled", v)}
        />
        <TextField
          label="Iframe URL"
          placeholder="https://your-ai-assistant.example.com/embed"
          {...form.register("iframeUrl")}
        />
        <TextField label="Button Label" placeholder="Ask AI" {...form.register("label")} />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
