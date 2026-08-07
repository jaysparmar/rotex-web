"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, FileVideo, Check } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchMediaAssets, uploadAndRegisterMedia, type MediaAssetDTO } from "@/lib/media-upload";

type MediaPickerProps = {
  type: "image" | "video";
  multiple?: boolean;
  onSelect: (urls: string[]) => void;
  triggerRender: React.ReactElement;
  children: React.ReactNode;
};

export function MediaPicker({ type, multiple = false, onSelect, triggerRender, children }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAssetDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  async function loadAssets() {
    setLoading(true);
    try {
      setAssets(await fetchMediaAssets(type));
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setSelected([]);
      loadAssets();
    }
  }

  function selectSingle(url: string) {
    onSelect([url]);
    setOpen(false);
  }

  function toggleMultiSelect(url: string) {
    setSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadAndRegisterMedia(file);
      setAssets((prev) => [asset, ...prev]);
      if (multiple) {
        toggleMultiSelect(asset.url);
      } else {
        selectSingle(asset.url);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function confirmSelection() {
    onSelect(selected);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={triggerRender}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Choose {type === "video" ? "Video" : "Image"}
            {multiple ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium hover:bg-accent">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Uploading..." : "Upload new"}
          <input
            type="file"
            accept={type === "video" ? "video/*" : "image/*"}
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>

        <div className="grid max-h-96 grid-cols-4 gap-3 overflow-y-auto">
          {loading && <p className="col-span-4 py-8 text-center text-sm text-muted-foreground">Loading...</p>}
          {!loading && assets.length === 0 && (
            <p className="col-span-4 py-8 text-center text-sm text-muted-foreground">No {type}s uploaded yet.</p>
          )}
          {assets.map((asset) => {
            const isSelected = selected.includes(asset.url);
            return (
              <button
                type="button"
                key={asset.id}
                onClick={() => (multiple ? toggleMultiSelect(asset.url) : selectSingle(asset.url))}
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 bg-muted/30 ${
                  isSelected ? "border-primary" : "border-transparent"
                }`}
              >
                {asset.type === "image" ? (
                  <Image src={asset.url} alt={asset.alt ?? asset.filename} fill className="object-cover" unoptimized />
                ) : (
                  <FileVideo className="size-8 text-muted-foreground" />
                )}
                {isSelected && (
                  <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {multiple && (
          <DialogFooter>
            <Button type="button" onClick={confirmSelection} disabled={selected.length === 0}>
              Add selected ({selected.length})
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
