"use client";

import { useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Upload, Link2, Loader2, X } from "lucide-react";
import { Field, TextField } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { adminFetch } from "@/lib/admin-fetch";

// Uploads to a flat string form path (e.g. "sidebarLogoLight"), unlike MediaField
// which expects a nested { src, alt } object.
export function FlatImageField({ name, label }: { name: string; label: string }) {
  const form = useFormContext();
  const [mode, setMode] = useState<"link" | "upload">("link");
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
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "link" ? "bg-background shadow-sm" : "text-muted-foreground"
          )}
        >
          <Link2 className="size-3.5" />
          Link
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "upload" ? "bg-background shadow-sm" : "text-muted-foreground"
          )}
        >
          <Upload className="size-3.5" />
          Upload
        </button>
      </div>

      {mode === "link" ? (
        <TextField label={label} {...form.register(name)} />
      ) : (
        <Field label={label}>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="gap-1.5"
            >
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              {uploading ? "Uploading..." : "Choose File"}
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
        </Field>
      )}

      {src && (
        <ImageLightboxTrigger src={src} alt={label} className="block overflow-hidden rounded-lg border border-border bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-32 w-full object-cover" />
        </ImageLightboxTrigger>
      )}
    </div>
  );
}
