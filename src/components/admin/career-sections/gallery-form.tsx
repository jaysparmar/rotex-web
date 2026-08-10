"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { GalleryMediaPicker, type PickerMediaAsset } from "@/components/admin/gallery-media-picker";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveCareerSection } from "@/app/admin/(dashboard)/career/actions";

type GalleryImage = { src: string; alt: string; size: "wide" | "narrow"; type: "image" | "video" };
type FormValues = { enabled: boolean; mediaIds: string[]; sizes: Record<string, "wide" | "narrow"> };

export function CareerGalleryForm({
  initialEnabled,
  initialData,
  allMedia,
}: {
  initialEnabled: boolean;
  initialData: { images: GalleryImage[] };
  allMedia: PickerMediaAsset[];
}) {
  const byUrl = new Map(allMedia.map((a) => [a.url, a]));
  const initialIds = initialData.images
    .map((img) => byUrl.get(img.src)?.id)
    .filter((id): id is string => Boolean(id));
  const initialSizes = Object.fromEntries(
    initialData.images
      .map((img) => {
        const id = byUrl.get(img.src)?.id;
        return id ? [id, img.size] : null;
      })
      .filter((entry): entry is [string, "wide" | "narrow"] => entry !== null)
  );

  const form = useForm<FormValues>({
    defaultValues: { enabled: initialEnabled, mediaIds: initialIds, sizes: initialSizes },
  });
  const { pending, error, success, run } = useSaveAction();
  const mediaIds = form.watch("mediaIds");
  const sizes = form.watch("sizes");

  function onSubmit(values: FormValues) {
    const byId = new Map(allMedia.map((a) => [a.id, a]));
    const images: GalleryImage[] = values.mediaIds
      .map((id) => {
        const asset = byId.get(id);
        if (!asset) return null;
        return { src: asset.url, alt: asset.alt ?? asset.filename, size: values.sizes[id] ?? "wide", type: asset.type };
      })
      .filter((img): img is GalleryImage => img !== null);

    run(async () => {
      try {
        await saveCareerSection("gallery", { enabled: values.enabled, data: { images } });
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
          Pick which images/videos from the Media Library show in the Career gallery, and drag their order with the
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
