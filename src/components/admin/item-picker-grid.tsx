"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PickerItem = { id: string; image: string; label: string; sublabel?: string };

const PAGE_SIZE = 12;

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.length > 8 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${items.length} items by name...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3 lg:grid-cols-4">
        {visibleItems.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No items match &quot;{search}&quot;.</p>
        )}
        {visibleItems.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <div key={item.id} className="flex flex-col gap-2 rounded-md border border-border p-2">
              <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted/30">
                <ImageLightboxTrigger src={item.image} alt={item.label} className="size-full">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      unoptimized
                      className={cn(imageFit === "contain" ? "object-contain p-2" : "object-cover")}
                    />
                  )}
                </ImageLightboxTrigger>
                <Switch
                  checked={checked}
                  onCheckedChange={(v) => onToggle(item.id, v)}
                  className="absolute right-1.5 top-1.5 border-border bg-muted shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm data-checked:bg-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.label}</p>
                {item.sublabel && <p className="truncate text-xs text-muted-foreground">{item.sublabel}</p>}
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} · Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
