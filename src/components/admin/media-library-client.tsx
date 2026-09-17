"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  uploadAndRegisterMedia,
  deleteMediaAsset,
  type MediaAssetDTO,
} from "@/lib/media-upload";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

const TYPE_OPTIONS = [
  { value: "", label: "All media" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
];

export function MediaLibraryClient({
  initialAssets,
  total,
  page,
  pageSize,
  q,
  type,
}: {
  initialAssets: MediaAssetDTO[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  type: string;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [prevInitialAssets, setPrevInitialAssets] = useState(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<MediaAssetDTO | null>(null);
  const { pageHref, setParam, router } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (initialAssets !== prevInitialAssets) {
    setPrevInitialAssets(initialAssets);
    setAssets(initialAssets);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAndRegisterMedia(file);
      // Resync with server-filtered/paginated state rather than appending
      // locally — the upload may not match the active type/search filter.
      router.refresh();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(null);
    setDeletingId(id);
    try {
      await deleteMediaAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            items={TYPE_OPTIONS}
            value={type}
            onValueChange={(v) => setParam("type", v as string)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All media" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium hover:bg-accent">
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {uploading ? "Uploading..." : "Upload file"}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {q || type
            ? "No media match your filters."
            : "No media uploaded yet."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {assets.map((asset) => (
            <div key={asset.id} className="space-y-2">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                {asset.type === "image" ? (
                  <Image
                    src={asset.url}
                    alt={asset.alt ?? asset.filename}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <>
                    <video
                      src={`${asset.url}#t=0.1`}
                      className="size-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="flex size-8 items-center justify-center rounded-full bg-black/50">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-4 fill-white ml-0.5"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {asset.filename}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={deletingId === asset.id}
                  onClick={() => setToDelete(asset)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          itemLabel="file"
          pageHref={pageHref}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete media asset"
        description={`Delete "${toDelete?.filename}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={deletingId !== null}
      />
    </div>
  );
}
