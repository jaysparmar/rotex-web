"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ExternalLink, FileArchive, Folder, FolderUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminFetch } from "@/lib/admin-fetch";
import { formatBytes } from "./image-job-progress";

type Entry = { name: string; path: string; type: "dir" | "zip"; size: number; modifiedAt: string };
type Listing = { root: string; path: string; parent: string | null; entries: Entry[] };

/** Browses folders on the server (limited to IMPORT_BROWSE_ROOT) and returns the picked .zip path. */
export function ServerZipPickerDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (zipPath: string) => void;
}) {
  const [dir, setDir] = useState<string | null>(null);
  // Result of the last listing request, tagged with the folder it was for.
  const [result, setResult] = useState<{ key: string; listing?: Listing; error?: string } | null>(null);
  const key = dir ?? "";
  const loading = open && result?.key !== key;
  const listing = result?.key === key ? result.listing ?? null : null;
  const error = result?.key === key ? result.error : undefined;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const query = key ? `?path=${encodeURIComponent(key)}` : "";
    adminFetch(`/api/admin/products/import/images/server-files${query}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error?.message ?? "Failed to list folder");
        if (!cancelled) setResult({ key, listing: json.data as Listing });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key, error: err instanceof Error ? err.message : "Failed to list folder" });
      });
    return () => {
      cancelled = true;
    };
  }, [open, key]);

  // Breadcrumb segments relative to the browse root.
  const crumbs: { label: string; path: string }[] = [];
  if (listing) {
    crumbs.push({ label: listing.root, path: listing.root });
    const rel = listing.path.slice(listing.root.length).split("/").filter(Boolean);
    let acc = listing.root;
    for (const seg of rel) {
      acc = `${acc}/${seg}`;
      crumbs.push({ label: seg, path: acc });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a zip on the server</DialogTitle>
          <DialogDescription>Browse to the zip that holds the variant images.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={c.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3" />}
              <button type="button" className="hover:text-foreground hover:underline" onClick={() => setDir(c.path)}>
                {c.label}
              </button>
            </span>
          ))}
        </div>

        <div className="h-80 overflow-auto rounded-lg border border-border">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading…
            </div>
          ) : error ? (
            <p className="p-4 text-sm text-destructive">{error}</p>
          ) : listing ? (
            <ul className="divide-y divide-border text-sm">
              {listing.parent && (
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50"
                    onClick={() => setDir(listing.parent)}
                  >
                    <FolderUp className="size-4 text-muted-foreground" /> ..
                  </button>
                </li>
              )}
              {listing.entries.length === 0 && (
                <li className="px-3 py-6 text-center text-muted-foreground">No folders or zip files here.</li>
              )}
              {listing.entries.map((e) => (
                <li key={e.path}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50"
                    onClick={() => (e.type === "dir" ? setDir(e.path) : onPick(e.path))}
                  >
                    {e.type === "dir" ? (
                      <Folder className="size-4 shrink-0 text-amber-500" />
                    ) : (
                      <FileArchive className="size-4 shrink-0 text-primary" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{e.name}</span>
                    {e.type === "zip" && (
                      <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(e.size)}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <a
            href="/admin/import-files"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Upload or manage files <ExternalLink className="size-3" />
          </a>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
