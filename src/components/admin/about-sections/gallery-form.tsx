"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { GalleryMediaPicker, type PickerMediaAsset } from "@/components/admin/gallery-media-picker";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type FormValues = { enabled: boolean; mediaIds: string[]; sizes: Record<string, "wide" | "narrow"> };

export function GalleryForm({
  initialEnabled,
  initialData,
  allMedia,
}: {
  initialEnabled: boolean;
  initialData: { mediaIds: string[]; sizes?: Record<string, "wide" | "narrow"> };
  allMedia: PickerMediaAsset[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      mediaIds: initialData.mediaIds ?? [],
      sizes: initialData.sizes ?? {},
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const mediaIds = form.watch("mediaIds");
  const sizes = form.watch("sizes");

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("gallery", { enabled, data });
        toast.success("Gallery section saved");
      } catch (err) {
        toast.error("Failed to save Gallery section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />

        <p className="text-xs text-muted-foreground">
          Pick which images/videos from the Media Library show in the About gallery, and drag their order with the
          arrows below. Upload new files on the{" "}
          <a href="/admin/media" className="underline">Media Library</a> page first.
        </p>

        {allMedia.length === 0 ? (
          <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            No media uploaded yet. Add some on the Media Library page first.
          </p>
        ) : (
          <GalleryMediaPicker
            allMedia={allMedia}
            selectedIds={mediaIds}
            sizes={sizes}
            onChangeSelected={(ids) => form.setValue("mediaIds", ids)}
            onChangeSizes={(next) => form.setValue("sizes", next)}
          />
        )}

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
