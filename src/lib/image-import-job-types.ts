/* Shared (client + server) types and pure helpers for the variant-image zip import. */

export type ImageJobStatus = "uploading" | "queued" | "extracting" | "done" | "failed";

export type ImageJobDTO = {
  id: string;
  status: ImageJobStatus;
  sourceType: "upload" | "server";
  originalName: string;
  totalBytes: number;
  uploadedBytes: number;
  totalItems: number;
  processedItems: number;
  copiedCount: number;
  missing: string[];
  error: string | null;
  createdAt: string;
};

export function isImageJobActive(status: ImageJobStatus): boolean {
  return status === "uploading" || status === "queued" || status === "extracting";
}

/**
 * Canonical form of a sheet reference or zip entry path, so `\Photos\A  b.JPG"`
 * and `Photos/a b.jpg` compare equal.
 */
export function normalizeRef(value: string): string {
  return value
    .replace(/["“”]/g, "")
    .replace(/\\/g, "/")
    .split("/")
    .map((seg) => seg.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("/")
    .toLowerCase();
}

/** Distinct, non-empty sheet references (first spelling wins), deduped by normalized form. */
export function distinctReferences(values: string[]): string[] {
  const seen = new Map<string, string>();
  for (const v of values) {
    const key = normalizeRef(v);
    if (key && !seen.has(key)) seen.set(key, v.trim());
  }
  return [...seen.values()];
}

/** First column whose header (on the chosen header row) mentions "image", or null. */
export function detectImageColumn(grid: string[][] | null, headerRow: number): number | null {
  const header = grid?.[headerRow - 1];
  if (!header) return null;
  const exact = header.findIndex((h) => /image of model/i.test(h));
  if (exact >= 0) return exact;
  const loose = header.findIndex((h) => /image|photo/i.test(h));
  return loose >= 0 ? loose : null;
}

/** Image references in one column, below the header row. */
export function columnReferences(grid: string[][], headerRow: number, column: number): string[] {
  return distinctReferences(grid.slice(headerRow).map((row) => row[column] ?? ""));
}
