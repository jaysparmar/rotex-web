"use client";

import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveChannelPartnerSection } from "@/app/admin/(dashboard)/channel-partner/actions";

type FormSectionData = {
  headingPrefix: string;
  headingHighlight: string;
  description: string;
};
type FormValues = {
  enabled: boolean;
  headingPrefix: string;
  headingHighlight: string;
  description: string;
};

export function ChannelPartnerFormSectionForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: FormSectionData;
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      headingPrefix: initialData.headingPrefix,
      headingHighlight: initialData.headingHighlight,
      description: initialData.description,
    },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveChannelPartnerSection("form", { enabled, data });
        toast.success("Application Form section saved");
      } catch (err) {
        toast.error("Failed to save Application Form section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Prefix" {...form.register("headingPrefix")} />
        <TextField label="Heading Highlight" {...form.register("headingHighlight")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <p className="text-xs text-muted-foreground">
          Form fields (which show, Industries Served options, etc.) are now configured on the{" "}
          <Link href="/admin/forms/channel-partner" className="underline">
            Form Fields → Channel Partner Application Form
          </Link>{" "}
          page instead of here.
        </p>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
