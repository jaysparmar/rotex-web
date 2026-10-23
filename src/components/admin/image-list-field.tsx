"use client";

import { useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Upload, Loader2, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { adminFetch } from "@/lib/admin-fetch";

// Drag reordering needs a stable id per row, but the field itself is a plain
// string[] of URLs (which aren't unique while a row is still empty/mid-upload)
// — so a parallel id list is generated once and kept in lockstep with the
// values array by every mutation here (add/remove/move), not derived from it.
let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `image-row-${idCounter}`;
}

export function ImageListField({ name, label }: { name: string; label: string }) {
  const form = useFormContext();
  const values = (useWatch({ control: form.control, name }) as string[] | undefined) ?? [];
  const [ids, setIds] = useState<string[]>(() => values.map(() => nextId()));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Keep the id list the same length as values if it ever drifts (e.g. the
  // form resets with different data) — appends/truncates without touching
  // ids for rows that still exist.
  if (ids.length !== values.length) {
    const next = values.map((_, i) => ids[i] ?? nextId());
    setIds(next);
  }

  function setValues(nextValues: string[]) {
    form.setValue(name, nextValues, { shouldDirty: true });
  }

  function updateAt(index: number, url: string) {
    setValues(values.map((v, i) => (i === index ? url : v)));
  }

  function removeAt(index: number) {
    setValues(values.filter((_, i) => i !== index));
    setIds(ids.filter((_, i) => i !== index));
  }

  function add() {
    setValues([...values, ""]);
    setIds([...ids, nextId()]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    setValues(arrayMove(values, oldIndex, newIndex));
    setIds(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <Field label={label}>
      <div className="space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {values.map((url, i) => (
              <ImageListRow
                key={ids[i]}
                id={ids[i]}
                url={url}
                onChange={(v) => updateAt(i, v)}
                onRemove={() => removeAt(i)}
              />
            ))}
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Upload className="size-3.5" />
          Add Image
        </Button>
        {values.length > 0 && <p className="text-xs text-muted-foreground">First image is used as the cover.</p>}
      </div>
    </Field>
  );
}

function ImageListRow({
  id,
  url,
  onChange,
  onRemove,
}: {
  id: string;
  url: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

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
    <div ref={setNodeRef} style={style} className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Reorder image"
          className="shrink-0 cursor-grab touch-none text-muted-foreground outline-none active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <Input className="h-9" value={url} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="shrink-0 gap-1.5">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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
