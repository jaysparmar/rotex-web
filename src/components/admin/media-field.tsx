"use client";

import { useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Upload, Link2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/admin/form-fields";
import { cn } from "@/lib/utils";

export function MediaField({
  name,
  mediaType,
  showAlt = true,
  defaultMode = "link",
  previewFit = "cover",
}: {
  name: string;
  mediaType: "image" | "video";
  showAlt?: boolean;
  defaultMode?: "link" | "upload";
  previewFit?: "cover" | "contain";
}) {
  const form = useFormContext();
  const [mode, setMode] = useState<"link" | "upload">(defaultMode);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const src = useWatch({ control: form.control, name: `${name}.src` }) as string | undefined;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(undefined);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? "Upload failed");
        return;
      }

      form.setValue(`${name}.src`, json.data.url, { shouldDirty: true });
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
        <TextField label="Media Src" {...form.register(`${name}.src`)} />
      ) : (
        <Field label="Media File">
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
            <input
              ref={inputRef}
              type="file"
              accept={mediaType === "video" ? "video/mp4,video/webm" : "image/*"}
              onChange={handleFileChange}
              className="hidden"
            />
            {src && (
              <button
                type="button"
                onClick={() => form.setValue(`${name}.src`, "", { shouldDirty: true })}
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
        <div className={cn("overflow-hidden rounded-lg border border-border bg-muted/30", previewFit === "contain" && "p-4")}>
          {mediaType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className={cn("h-32 w-full", previewFit === "contain" ? "object-contain" : "object-cover")} />
          ) : (
            <video src={src} className={cn("h-32 w-full", previewFit === "contain" ? "object-contain" : "object-cover")} muted />
          )}
        </div>
      )}

      {showAlt && <TextField label="Media Alt" {...form.register(`${name}.alt`)} />}
    </div>
  );
}
