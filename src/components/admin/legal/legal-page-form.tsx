"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/admin/form-fields";
import { RichTextField } from "@/components/admin/rich-text-field";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveLegalPage } from "@/app/admin/(dashboard)/legal/actions";

type FormValues = { title: string; content: string };

export function LegalPageForm({
  pageKey,
  initialTitle,
  initialContent,
}: {
  pageKey: string;
  initialTitle: string;
  initialContent: string;
}) {
  const form = useForm<FormValues>({ defaultValues: { title: initialTitle, content: initialContent } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    run(async () => {
      try {
        await saveLegalPage(pageKey, values);
        toast.success("Legal page saved");
      } catch (err) {
        toast.error("Failed to save legal page");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TextField label="Title" {...form.register("title", { required: true })} />
        <RichTextField name="content" label="Content" />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
