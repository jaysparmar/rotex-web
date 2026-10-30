"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  File as FileIcon,
  FileArchive,
  Folder,
  FolderPlus,
  FolderUp,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { adminFetch } from "@/lib/admin-fetch";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/components/admin/products/import/image-job-progress";

const API = "/api/admin/import-files";
const CHUNK_SIZE = 8 * 1024 * 1024;

type Entry = { name: string; path: string; type: "dir" | "file"; size: number; modifiedAt: string };
type Listing = { root: string; path: string; parent: string | null; entries: Entry[] };
type UploadItem = {
  id: string;
  file: File;
  dir: string;
  uploaded: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
  resumedFrom?: number;
};

async function postAction(body: object) {
  const res = await adminFetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "Action failed");
}

/*
  File manager for the server's import folder (IMPORT_BROWSE_ROOT). Big files go up
  in 8MB chunks; if the page is refreshed mid-upload, choosing the same file again
  into the same folder continues from where it stopped.
*/
export function ImportFileManager() {
  const [dir, setDir] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{ key: string; listing?: Listing; error?: string } | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [nameDialog, setNameDialog] = useState<{ mode: "mkdir" | "rename"; entry?: Entry; value: string } | null>(null);
  const [deleting, setDeleting] = useState<Entry | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const processing = useRef(false);
  const queue = useRef<UploadItem[]>([]);

  const key = `${dir ?? ""}#${reloadKey}`;
  const loading = result?.key !== key;
  const listing = result?.key === key ? result.listing ?? null : null;
  const error = result?.key === key ? result.error : undefined;
  const currentDir = listing?.path ?? null;

  useEffect(() => {
    let cancelled = false;
    const query = dir ? `?path=${encodeURIComponent(dir)}` : "";
    adminFetch(`${API}${query}`)
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
  }, [dir, key]);

  const uploading = uploads.some((u) => u.status === "queued" || u.status === "uploading");

  // Leaving mid-upload loses the in-flight chunk only, but warn anyway.
  useEffect(() => {
    if (!uploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);

  const refresh = () => setReloadKey((k) => k + 1);

  function patchUpload(id: string, patch: Partial<UploadItem>) {
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  async function uploadOne(item: UploadItem) {
    patchUpload(item.id, { status: "uploading" });
    const { file } = item;
    const base = `${API}/upload?dir=${encodeURIComponent(item.dir)}&name=${encodeURIComponent(file.name)}&total=${file.size}`;
    let offset = 0;
    let first = true;
    try {
      while (true) {
        const res = await adminFetch(`${base}&offset=${offset}`, {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: file.slice(offset, offset + CHUNK_SIZE),
        });
        const json = await res.json();
        if (!json.success) {
          if (json.error?.code === "OFFSET_MISMATCH") {
            offset = json.error.uploadedBytes;
            if (first && offset > 0) patchUpload(item.id, { resumedFrom: offset });
            first = false;
            continue;
          }
          throw new Error(json.error?.message ?? "Upload failed");
        }
        first = false;
        offset = json.data.uploadedBytes;
        patchUpload(item.id, { uploaded: offset });
        if (json.data.done) break;
      }
      patchUpload(item.id, { status: "done", uploaded: file.size });
    } catch (err) {
      patchUpload(item.id, { status: "error", error: err instanceof Error ? err.message : "Upload failed" });
    }
  }

  async function processQueue() {
    if (processing.current) return;
    processing.current = true;
    while (queue.current.length) {
      const next = queue.current.shift()!;
      await uploadOne(next);
      refresh();
    }
    processing.current = false;
  }

  function addFiles(files: FileList | File[]) {
    if (!currentDir) return;
    const items: UploadItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      dir: currentDir,
      uploaded: 0,
      status: "queued",
    }));
    if (!items.length) return;
    setUploads((list) => [...list, ...items]);
    queue.current.push(...items);
    processQueue();
  }

  async function submitName() {
    if (!nameDialog || !currentDir) return;
    setBusy(true);
    try {
      if (nameDialog.mode === "mkdir") {
        await postAction({ action: "mkdir", path: currentDir, name: nameDialog.value });
        toast.success("Folder created");
      } else if (nameDialog.entry) {
        await postAction({ action: "rename", path: nameDialog.entry.path, name: nameDialog.value });
        toast.success("Renamed");
      }
      setNameDialog(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await postAction({ action: "delete", path: deleting.path });
      toast.success(`Deleted ${deleting.name}`);
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const crumbs: { label: string; path: string }[] = [];
  if (listing) {
    crumbs.push({ label: listing.root.split("/").pop() || listing.root, path: listing.root });
    let acc = listing.root;
    for (const seg of listing.path.slice(listing.root.length).split("/").filter(Boolean)) {
      acc = `${acc}/${seg}`;
      crumbs.push({ label: seg, path: acc });
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
              {crumbs.map((c, i) => (
                <span key={c.path} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
                  <button
                    type="button"
                    className={cn(
                      "hover:underline",
                      i === crumbs.length - 1 ? "font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setDir(c.path)}
                  >
                    {c.label}
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={refresh}>
                <RefreshCw className="size-3.5" /> Refresh
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={!currentDir}
                onClick={() => setNameDialog({ mode: "mkdir", value: "" })}
              >
                <FolderPlus className="size-3.5" /> New folder
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                disabled={!currentDir}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-3.5" /> Upload files
              </Button>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div
            className={cn(
              "min-h-80 rounded-lg border border-border transition-colors",
              dragOver && "border-primary bg-primary/5"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            {loading ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading…
              </div>
            ) : error ? (
              <p className="p-4 text-sm text-destructive">{error}</p>
            ) : listing ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="hidden w-28 px-3 py-2 font-medium sm:table-cell">Size</th>
                    <th className="hidden w-44 px-3 py-2 font-medium md:table-cell">Modified</th>
                    <th className="w-24 px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listing.parent && (
                    <tr className="hover:bg-muted/40">
                      <td colSpan={4} className="px-3 py-2">
                        <button type="button" className="flex items-center gap-2" onClick={() => setDir(listing.parent)}>
                          <FolderUp className="size-4 text-muted-foreground" /> ..
                        </button>
                      </td>
                    </tr>
                  )}
                  {listing.entries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-12 text-center text-muted-foreground">
                        This folder is empty. Drop files here or use Upload files.
                      </td>
                    </tr>
                  )}
                  {listing.entries.map((e) => (
                    <tr key={e.path} className="group hover:bg-muted/40">
                      <td className="max-w-0 px-3 py-2">
                        {e.type === "dir" ? (
                          <button
                            type="button"
                            className="flex w-full min-w-0 items-center gap-2 text-left"
                            onClick={() => setDir(e.path)}
                          >
                            <Folder className="size-4 shrink-0 text-amber-500" />
                            <span className="truncate">{e.name}</span>
                          </button>
                        ) : (
                          <span className="flex min-w-0 items-center gap-2">
                            {/\.zip$/i.test(e.name) ? (
                              <FileArchive className="size-4 shrink-0 text-primary" />
                            ) : (
                              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate">{e.name}</span>
                          </span>
                        )}
                      </td>
                      <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                        {e.type === "file" ? formatBytes(e.size) : "—"}
                      </td>
                      <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">
                        {new Date(e.modifiedAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label={`Rename ${e.name}`}
                            onClick={() => setNameDialog({ mode: "rename", entry: e, value: e.name })}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            aria-label={`Delete ${e.name}`}
                            onClick={() => setDeleting(e)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Uploads</p>
              {!uploading && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setUploads([])}>
                  Clear
                </Button>
              )}
            </div>
            {uploads.map((u) => {
              const pct = u.file.size ? (u.uploaded / u.file.size) * 100 : u.status === "done" ? 100 : 0;
              return (
                <div key={u.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5">
                      {u.status === "done" ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                      ) : u.status === "error" ? (
                        <XCircle className="size-3.5 shrink-0 text-destructive" />
                      ) : u.status === "uploading" ? (
                        <Loader2 className="size-3.5 shrink-0 animate-spin" />
                      ) : null}
                      <span className="truncate font-medium">{u.file.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {u.status === "error"
                        ? u.error
                        : u.status === "queued"
                          ? "Waiting…"
                          : `${formatBytes(u.uploaded)} / ${formatBytes(u.file.size)} · ${Math.floor(pct)}%`}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-300",
                        u.status === "error" ? "bg-destructive" : u.status === "done" ? "bg-emerald-500" : "bg-primary"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {u.resumedFrom != null && (
                    <p className="text-xs text-muted-foreground">Resumed from {formatBytes(u.resumedFrom)}.</p>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              If the page is refreshed during an upload, choose the same file again in the same folder to continue.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={nameDialog != null} onOpenChange={(open) => !open && setNameDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{nameDialog?.mode === "mkdir" ? "New folder" : `Rename "${nameDialog?.entry?.name}"`}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitName();
            }}
            className="space-y-4"
          >
            <Input
              autoFocus
              value={nameDialog?.value ?? ""}
              onChange={(e) => setNameDialog((d) => (d ? { ...d, value: e.target.value } : d))}
              placeholder="Name"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNameDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !nameDialog?.value.trim()}>
                {nameDialog?.mode === "mkdir" ? "Create" : "Rename"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        description={
          deleting?.type === "dir"
            ? "This folder and everything inside it will be permanently deleted from the server."
            : "This file will be permanently deleted from the server."
        }
        onConfirm={confirmDelete}
        pending={busy}
        pendingLabel="Deleting…"
      />
    </div>
  );
}
