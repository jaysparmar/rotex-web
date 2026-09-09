"use client";

import { useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Upload, Loader2, X, ChevronUp, ChevronDown } from "lucide-react";
import { Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { adminFetch } from "@/lib/admin-fetch";

export function ImageListField({ name, label }: { name: string; label: string }) {
  const form = useFormContext();
  const values = (useWatch({ control: form.control, name }) as string[] | undefined) ?? [];

  function setValues(next: string[]) {
    form.setValue(name, next, { shouldDirty: true });
  }

  function updateAt(index: number, url: string) {
    setValues(values.map((v, i) => (i === index ? url : v)));
  }

  function removeAt(index: number) {
    setValues(values.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    setValues(next);
  }

  return (
    <Field label={label}>
      <div className="space-y-3">
        {values.map((url, i) => (
          <ImageListRow
            key={i}
            index={i}
            url={url}
            isFirst={i === 0}
            isLast={i === values.length - 1}
            onChange={(v) => updateAt(i, v)}
            onRemove={() => removeAt(i)}
            onMoveUp={() => move(i, -1)}
            onMoveDown={() => move(i, 1)}
          />
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setValues([...values, ""])} className="gap-1.5">
          <Upload className="size-3.5" />
          Add Image
        </Button>
        {values.length > 0 && <p className="text-xs text-muted-foreground">First image is used as the cover.</p>}
      </div>
    </Field>
  );
}

function ImageListRow({
  index,
  url,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  index: number;
  url: string;
  isFirst: boolean;
  isLast: boolean;
  onChange: (url: string) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

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

      onChange(json.data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">{index + 1}</span>
        <Input className="h-9" value={url} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="shrink-0 gap-1.5">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <Button type="button" variant="ghost" size="icon-sm" disabled={isFirst} onClick={onMoveUp}>
          <ChevronUp className="size-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" disabled={isLast} onClick={onMoveDown}>
          <ChevronDown className="size-3.5" />
        </Button>
        <button type="button" onClick={onRemove} className="shrink-0 text-muted-foreground hover:text-destructive">
          <X className="size-4" />
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {url && (
        <ImageLightboxTrigger src={url} alt="" className="block w-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-20 w-32 rounded-lg border border-border object-cover" />
        </ImageLightboxTrigger>
      )}
    </div>
  );
}
