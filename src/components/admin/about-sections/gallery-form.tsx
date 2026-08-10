"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { FileVideo } from "lucide-react";
import Image from "next/image";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type MediaAsset = { id: string; url: string; type: "image" | "video"; filename: string; alt: string | null };
type FormValues = { enabled: boolean; mediaIds: string[] };

export function GalleryForm({
  initialEnabled,
  initialData,
  allMedia,
}: {
  initialEnabled: boolean;
  initialData: { mediaIds: string[] };
  allMedia: MediaAsset[];
}) {
  const form = useForm<FormValues>({
    defaultValues: { enabled: initialEnabled, mediaIds: initialData.mediaIds ?? [] },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected = form.watch("mediaIds");

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("mediaIds");
    form.setValue("mediaIds", checked ? [...current, id] : current.filter((m) => m !== id));
  }

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
          Pick which images/videos from the Media Library show in the About gallery. Upload new files on the{" "}
          <a href="/admin/media" className="underline">Media Library</a> page first.
        </p>

        <div className="space-y-1 rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Gallery Media ({selected.length} selected)
          </span>
          {allMedia.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No media uploaded yet. Add some on the Media Library page first.
            </p>
          )}
          {allMedia.map((asset) => (
            <div key={asset.id} className="flex items-center gap-4 border-t border-border p-4">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {asset.type === "image" ? (
                  <Image src={asset.url} alt={asset.alt ?? ""} width={48} height={48} className="size-full object-cover" unoptimized />
                ) : (
                  <FileVideo className="size-5 text-muted-foreground" />
                )}
              </div>
              <span className="flex-1 truncate text-sm font-medium">{asset.filename}</span>
              <Switch
                checked={selected.includes(asset.id)}
                onCheckedChange={(v) => toggle(asset.id, v)}
              />
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
