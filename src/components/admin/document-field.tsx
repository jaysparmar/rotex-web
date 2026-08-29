"use client";

import { useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Upload, Loader2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/admin/form-fields";
import { adminFetch } from "@/lib/admin-fetch";

export function DocumentField({ name, label = "File" }: { name: string; label?: string }) {
  const form = useFormContext();
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
      const res = await adminFetch("/api/admin/upload", { method: "POST", body: formData });
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
      <TextField label={`${label} URL`} {...form.register(`${name}.src`)} />

      <Field label="Upload File">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="gap-1.5">
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {uploading ? "Uploading..." : "Choose File"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          {src && (
            <a href={src} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <FileText className="size-3.5" />
              View current file
            </a>
          )}
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
    </div>
  );
}
