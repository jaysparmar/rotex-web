"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SaveBar } from "@/components/admin/section-form-shell";
import { FlatImageField } from "@/components/admin/flat-image-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAdminConfig } from "@/app/admin/(dashboard)/home/actions";

type FormValues = PrismaJson.AdminConfigData;

export function AdminConfigForm({ initialData }: { initialData: FormValues }) {
  const form = useForm<FormValues>({ defaultValues: initialData });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    run(async () => {
      try {
        await saveAdminConfig(values);
        toast.success("Admin panel branding saved");
      } catch (err) {
        toast.error("Failed to save admin panel branding");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FlatImageField name="sidebarLogoLight" label="Sidebar Logo — Light Theme" />
          <FlatImageField name="sidebarLogoDark" label="Sidebar Logo — Dark Theme" />
          <FlatImageField name="fallbackPlaceholderImage" label="Default Image Placeholder" />
        </div>
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
