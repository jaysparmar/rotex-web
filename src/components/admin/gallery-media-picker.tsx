"use client";

import Image from "next/image";
import { X, Plus, GripVertical } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PickerMediaAsset = { id: string; url: string; type: "image" | "video"; filename: string; alt: string | null };

function Thumb({ asset }: { asset: PickerMediaAsset }) {
  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
      {asset.type === "image" ? (
        <Image src={asset.url} alt={asset.alt ?? ""} width={48} height={48} className="size-full object-cover" unoptimized />
      ) : (
        <video src={`${asset.url}#t=0.1`} className="size-full object-cover" muted playsInline preload="metadata" />
      )}
    </div>
  );
}

/**
 * Reusable picker for admin gallery sections backed by the Media Library.
 * Selected items are shown in the exact order they'll render on the site,
 * drag to reorder — separate from the "add more" list below, whose order is
 * irrelevant since it's not what gets saved.
 */
export function GalleryMediaPicker({
  allMedia,
  selectedIds,
  sizes,
  onChangeSelected,
  onChangeSizes,
}: {
  allMedia: PickerMediaAsset[];
  selectedIds: string[];
  sizes: Record<string, "wide" | "narrow">;
  onChangeSelected: (ids: string[]) => void;
  onChangeSizes: (sizes: Record<string, "wide" | "narrow">) => void;
}) {
  const byId = new Map(allMedia.map((a) => [a.id, a]));
  const selectedAssets = selectedIds.map((id) => byId.get(id)).filter((a): a is PickerMediaAsset => Boolean(a));
  const unselected = allMedia.filter((a) => !selectedIds.includes(a.id));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function remove(id: string) {
    onChangeSelected(selectedIds.filter((i) => i !== id));
  }

  function add(id: string) {
    onChangeSelected([...selectedIds, id]);
  }

  function setSize(id: string, size: "wide" | "narrow") {
    onChangeSizes({ ...sizes, [id]: size });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selectedIds.indexOf(active.id as string);
    const newIndex = selectedIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    onChangeSelected(arrayMove(selectedIds, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border">
        <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Selected ({selectedAssets.length}) — drag to reorder, shown on site in this order
        </span>
        {selectedAssets.length === 0 && (
          <p className="border-t border-border p-4 text-sm text-muted-foreground">Nothing selected yet.</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
            {selectedAssets.map((asset) => (
              <SelectedAssetRow key={asset.id} asset={asset} size={sizes[asset.id] ?? "wide"} onSetSize={setSize} onRemove={remove} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {unselected.length > 0 && (
        <div className="rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Add from Media Library
          </span>
          {unselected.map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 border-t border-border p-3">
              <Thumb asset={asset} />
              <span className="flex-1 truncate text-sm font-medium">{asset.filename}</span>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => add(asset.id)}>
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectedAssetRow({
  asset,
  size,
  onSetSize,
  onRemove,
}: {
  asset: PickerMediaAsset;
  size: "wide" | "narrow";
  onSetSize: (id: string, size: "wide" | "narrow") => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: asset.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 border-t border-border bg-card p-3">
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${asset.filename}`}
        className="cursor-grab touch-none text-muted-foreground outline-none active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <Thumb asset={asset} />
      <span className="flex-1 truncate text-sm font-medium">{asset.filename}</span>
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => onSetSize(asset.id, "wide")}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            size === "wide" ? "bg-background shadow-sm" : "text-muted-foreground"
          )}
        >
          Wide
        </button>
        <button
          type="button"
          onClick={() => onSetSize(asset.id, "narrow")}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            size === "narrow" ? "bg-background shadow-sm" : "text-muted-foreground"
          )}
        >
          Narrow
        </button>
      </div>
      <Button type="button" variant="ghost" size="icon-sm" onClick={() => onRemove(asset.id)}>
        <X className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
