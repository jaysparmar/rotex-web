"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { TextField, SwitchField } from "@/components/admin/form-fields";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveGlobalConfig } from "@/app/admin/(dashboard)/home/actions";

type FormValues = { enabled: boolean; link: string };

export function WhatsappConfigForm({ config }: { config: PrismaJson.GlobalConfigData }) {
  const form = useForm<FormValues>({
    defaultValues: config.whatsapp ?? { enabled: false, link: "" },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    run(async () => {
      try {
        await saveGlobalConfig({ ...config, whatsapp: values });
        toast.success("WhatsApp button saved");
      } catch (err) {
        toast.error("Failed to save WhatsApp button");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <SwitchField
          label="Show floating WhatsApp button"
          checked={form.watch("enabled")}
          onCheckedChange={(v) => form.setValue("enabled", v)}
        />
        <TextField
          label="WhatsApp Link"
          placeholder="https://wa.me/919876543210"
          {...form.register("link")}
        />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
