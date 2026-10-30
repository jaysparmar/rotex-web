"use client";

import { useEffect, useRef, useState } from "react";
import { FileArchive, FolderSearch, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/admin/form-fields";
import { adminFetch } from "@/lib/admin-fetch";
import { excelColumnLabel } from "@/lib/excel-columns";
import { columnReferences, isImageJobActive, type ImageJobDTO } from "@/lib/image-import-job-types";
import { ImageJobProgress } from "./image-job-progress";
import { PlainSelect } from "./plain-select";
import { ServerZipPickerDialog } from "./server-zip-picker-dialog";

const CHUNK_SIZE = 8 * 1024 * 1024;
const STORAGE_KEY = "rotex.import.variantImageJobId";
const API = "/api/admin/products/import/images";

function rememberJob(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked — refresh-restore falls back to the server's job list.
  }
}

function rememberedJob(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

async function fetchJob(id: string): Promise<ImageJobDTO | null> {
  const res = await adminFetch(`${API}/jobs/${id}`);
  const json = await res.json();
  return json.success ? (json.data as ImageJobDTO) : null;
}

/*
  Zip of variant photos for the sheet's image column. The copy runs as a server
  job; this card only starts it, uploads the zip in resumable chunks when it comes
  from the browser, and polls progress. The job id is kept in localStorage so a
  refresh re-attaches to the same job.
*/
export function VariantImagesCard({
  grid,
  headerRow,
  imageColumn,
  onImageColumnChange,
  job,
  onJobChange,
}: {
  grid: string[][] | null;
  headerRow: number;
  imageColumn: number | null;
  onImageColumnChange: (column: number | null) => void;
  job: ImageJobDTO | null;
  onJobChange: (job: ImageJobDTO | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadingHere, setUploadingHere] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const unmounted = useRef(false);

  const header = grid?.[headerRow - 1] ?? [];
  const columnCount = grid ? grid.reduce((max, row) => Math.max(max, row.length), 0) : 0;
  const references = grid && imageColumn != null ? columnReferences(grid, headerRow, imageColumn) : [];

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
    };
  }, []);

  // Re-attach after a refresh, but only to a job that's still running — a finished
  // or failed job from an earlier visit is forgotten so the card starts empty.
  useEffect(() => {
    if (job) return;
    let cancelled = false;
    (async () => {
      const id = rememberedJob();
      let restored = id ? await fetchJob(id) : null;
      if (restored && !isImageJobActive(restored.status)) {
        rememberJob(null);
        restored = null;
      }
      if (!restored) {
        const res = await adminFetch(`${API}/jobs`);
        const json = await res.json();
        const jobs = (json.success ? json.data : []) as ImageJobDTO[];
        restored = jobs.find((j) => isImageJobActive(j.status)) ?? null;
      }
      if (!cancelled && restored) onJobChange(restored);
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
    // Only on mount — later job changes come from this card itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll while the server is working on it (an upload in this tab reports its own progress).
  const jobId = job?.id;
  const jobStatus = job?.status;
  useEffect(() => {
    if (!jobId || !jobStatus || jobStatus === "done" || jobStatus === "failed") return;
    if (jobStatus === "uploading") return;
    const timer = setInterval(async () => {
      const latest = await fetchJob(jobId).catch(() => null);
      if (latest && !unmounted.current) onJobChange(latest);
    }, 1000);
    return () => clearInterval(timer);
  }, [jobId, jobStatus, onJobChange]);

  async function uploadChunks(file: File, start: ImageJobDTO) {
    setUploadingHere(true);
    let current = start;
    let offset = start.uploadedBytes;
    try {
      while (offset < file.size && !unmounted.current) {
        const res = await adminFetch(`${API}/jobs/${current.id}/chunk?offset=${offset}`, {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: file.slice(offset, offset + CHUNK_SIZE),
        });
        const json = await res.json();
        if (!json.success) {
          if (json.error?.code === "OFFSET_MISMATCH") {
            offset = json.error.uploadedBytes;
            continue;
          }
          throw new Error(json.error?.message ?? "Upload failed");
        }
        current = json.data as ImageJobDTO;
        offset = current.uploadedBytes;
        onJobChange(current);
      }
    } finally {
      setUploadingHere(false);
    }
  }

  async function startJob(body: object) {
    const res = await adminFetch(`${API}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, references }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Failed to start image job");
    const created = json.data as ImageJobDTO;
    rememberJob(created.id);
    onJobChange(created);
    return created;
  }

  async function handleZipFile(file: File) {
    setError(undefined);
    try {
      // Same file picked again for a paused upload → resume instead of starting over.
      if (job?.status === "uploading" && job.originalName === file.name && job.totalBytes === file.size) {
        const latest = (await fetchJob(job.id)) ?? job;
        await uploadChunks(file, latest);
        return;
      }
      const created = await startJob({ sourceType: "upload", fileName: file.name, totalBytes: file.size });
      await uploadChunks(file, created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleServerPick(zipPath: string) {
    setPickerOpen(false);
    setError(undefined);
    try {
      await startJob({ sourceType: "server", serverPath: zipPath });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start image job");
    }
  }

  function clearJob() {
    rememberJob(null);
    onJobChange(null);
    setError(undefined);
  }

  const busy = uploadingHere || (job != null && (job.status === "queued" || job.status === "extracting"));
  const pausedUpload = job?.status === "uploading" && !uploadingHere;
  const columnOptions = [
    { value: "none", label: "— No variant images —" },
    ...Array.from({ length: columnCount }, (_, i) => ({
      value: String(i),
      label: `${excelColumnLabel(i)}${header[i] ? ` — ${header[i]}` : ""}`,
    })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant images (optional)</CardTitle>
        <CardDescription>
          A zip holding the photos named in the sheet&apos;s image column. Only those photos are copied, in the
          background — you can keep going or refresh the page while it runs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!grid && (
          <p className="text-xs text-muted-foreground">Upload the sheet above to choose its image column and a zip.</p>
        )}
        {grid && (
        <Field label="Image column">
          <PlainSelect
            className="h-9 max-w-md"
            value={imageColumn == null ? "none" : String(imageColumn)}
            onValueChange={(v) => onImageColumnChange(v === "none" ? null : Number(v))}
            options={columnOptions}
          />
        </Field>
        )}
        {grid && imageColumn != null && (
          <p className="text-xs text-muted-foreground">
            {references.length} distinct image path{references.length === 1 ? "" : "s"} in this column.
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleZipFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={busy || references.length === 0}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {pausedUpload ? "Re-select zip to resume" : "Upload zip"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={busy || references.length === 0}
            onClick={() => setPickerOpen(true)}
          >
            <FolderSearch className="size-3.5" />
            Choose from server
          </Button>
          {job && !busy && (
            <Button type="button" variant="ghost" className="gap-1.5" onClick={clearJob}>
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>

        {pausedUpload && (
          <p className="text-xs text-amber-600">
            The upload of {job.originalName} was interrupted. Choose the same file again to continue where it stopped.
          </p>
        )}

        {job && (
          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileArchive className="size-4 text-primary" /> Image copy job
            </div>
            <ImageJobProgress job={job} uploadingHere={uploadingHere} />
            {job.status === "done" && job.missing.length > 0 && (
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-amber-600">
                  {job.missing.length} image path{job.missing.length === 1 ? "" : "s"} not found in the zip
                </summary>
                <ul className="mt-2 max-h-40 space-y-0.5 overflow-auto font-mono text-muted-foreground">
                  {job.missing.map((m) => (
                    <li key={m} className="break-all">
                      {m}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>

      <ServerZipPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onPick={handleServerPick} />
    </Card>
  );
}
