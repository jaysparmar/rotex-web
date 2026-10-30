"use client";

import type { ImageJobDTO } from "@/lib/image-import-job-types";
import { cn } from "@/lib/utils";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}

function Bar({ percent, tone }: { percent: number; tone: "primary" | "success" | "destructive" }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300",
          tone === "primary" && "bg-primary",
          tone === "success" && "bg-emerald-500",
          tone === "destructive" && "bg-destructive"
        )}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}

/** Two-phase progress (upload bytes, then images copied) for one image job. */
export function ImageJobProgress({ job, uploadingHere }: { job: ImageJobDTO; uploadingHere: boolean }) {
  const uploadPct = job.totalBytes > 0 ? (job.uploadedBytes / job.totalBytes) * 100 : 0;
  const extractPct = job.totalItems > 0 ? (job.processedItems / job.totalItems) * 100 : 0;

  let label: string;
  let percent: number;
  let tone: "primary" | "success" | "destructive" = "primary";
  switch (job.status) {
    case "uploading":
      percent = uploadPct;
      label = uploadingHere
        ? `Uploading ${formatBytes(job.uploadedBytes)} of ${formatBytes(job.totalBytes)}`
        : `Upload paused at ${formatBytes(job.uploadedBytes)} of ${formatBytes(job.totalBytes)}`;
      break;
    case "queued":
      percent = 0;
      label = "Waiting to start copying images…";
      break;
    case "extracting":
      percent = extractPct;
      label = `Copying images ${job.processedItems} of ${job.totalItems}`;
      break;
    case "done":
      percent = 100;
      tone = "success";
      label = `Done — ${job.copiedCount} of ${job.totalItems} images copied`;
      break;
    default:
      percent = 100;
      tone = "destructive";
      label = `Failed${job.error ? `: ${job.error}` : ""}`;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="min-w-0 truncate font-medium">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">{Math.floor(percent)}%</span>
      </div>
      <Bar percent={percent} tone={tone} />
      <p className="truncate text-xs text-muted-foreground">
        {job.sourceType === "server" ? "Server file" : "Uploaded file"}: {job.originalName} ({formatBytes(job.totalBytes)})
      </p>
    </div>
  );
}
