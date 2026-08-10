"use client";

import Image from "next/image";
import { ChevronUp, ChevronDown, X, Plus } from "lucide-react";
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
 * with up/down controls to reorder — separate from the "add more" list below,
 * whose order is irrelevant since it's not what gets saved.
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

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    onChangeSelected(next);
  }

  function remove(id: string) {
    onChangeSelected(selectedIds.filter((i) => i !== id));
  }

  function add(id: string) {
    onChangeSelected([...selectedIds, id]);
  }

  function setSize(id: string, size: "wide" | "narrow") {
    onChangeSizes({ ...sizes, [id]: size });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border">
        <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Selected ({selectedAssets.length}) — shown on site in this order
        </span>
        {selectedAssets.length === 0 && (
          <p className="border-t border-border p-4 text-sm text-muted-foreground">Nothing selected yet.</p>
        )}
        {selectedAssets.map((asset, i) => (
          <div key={asset.id} className="flex items-center gap-3 border-t border-border p-3">
            <div className="flex flex-col">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                disabled={i === selectedAssets.length - 1}
                onClick={() => move(i, 1)}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
            <Thumb asset={asset} />
            <span className="flex-1 truncate text-sm font-medium">{asset.filename}</span>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setSize(asset.id, "wide")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  (sizes[asset.id] ?? "wide") === "wide" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                Wide
              </button>
              <button
                type="button"
                onClick={() => setSize(asset.id, "narrow")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  sizes[asset.id] === "narrow" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                Narrow
              </button>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(asset.id)}>
              <X className="size-3.5 text-destructive" />
            </Button>
          </div>
        ))}
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
