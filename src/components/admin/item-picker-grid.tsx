"use client";

import Image from "next/image";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type PickerItem = { id: string; image: string; label: string; sublabel?: string };

export function ItemPickerGrid({
  items,
  selectedIds,
  onToggle,
  emptyMessage,
  imageFit = "contain",
}: {
  items: PickerItem[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  emptyMessage: string;
  imageFit?: "contain" | "cover";
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const checked = selectedIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-md border border-border p-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted/30">
              <ImageLightboxTrigger src={item.image} alt={item.label} className="size-full">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    unoptimized
                    className={cn(
                      imageFit === "contain" ? "object-contain p-2" : "object-cover"
                    )}
                  />
                )}
              </ImageLightboxTrigger>
              <Switch
                checked={checked}
                onCheckedChange={(v) => onToggle(item.id, v)}
                className="absolute right-1.5 top-1.5 bg-background/80 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.label}</p>
              {item.sublabel && (
                <p className="truncate text-xs text-muted-foreground">{item.sublabel}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
