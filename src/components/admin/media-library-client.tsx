"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, FileVideo, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAndRegisterMedia, deleteMediaAsset, type MediaAssetDTO } from "@/lib/media-upload";

export function MediaLibraryClient({ initialAssets }: { initialAssets: MediaAssetDTO[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadAndRegisterMedia(file);
      setAssets((prev) => [asset, ...prev]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media asset? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteMediaAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium hover:bg-accent">
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {uploading ? "Uploading..." : "Upload file"}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {assets.map((asset) => (
            <div key={asset.id} className="space-y-2">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                {asset.type === "image" ? (
                  <Image src={asset.url} alt={asset.alt ?? asset.filename} fill className="object-cover" unoptimized />
                ) : (
                  <FileVideo className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">{asset.filename}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={deletingId === asset.id}
                  onClick={() => handleDelete(asset.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
