"use client";

import { useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Upload, Loader2, X } from "lucide-react";
import { Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { adminFetch } from "@/lib/admin-fetch";

export function ImageUrlField({ name, label }: { name: string; label: string }) {
  const form = useFormContext();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const src = useWatch({ control: form.control, name }) as string | undefined;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(undefined);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await adminFetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? "Upload failed");
        return;
      }

      form.setValue(name, json.data.url, { shouldDirty: true });
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <Input className="h-9" {...form.register(name)} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 gap-1.5"
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {src && (
          <button
            type="button"
            onClick={() => form.setValue(name, "", { shouldDirty: true })}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {src && (
        <ImageLightboxTrigger src={src} alt={label} className="mt-2 block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-24 w-full rounded-lg border border-border object-cover" />
        </ImageLightboxTrigger>
      )}
    </Field>
  );
}
