import { excelColumnLabel } from "@/lib/excel-columns";

export type DownloadImportLink = { text: string; href: string };
export type DownloadImportCell = { text: string; links: DownloadImportLink[]; colSpan?: number };
/** Dense grid: index i holds spreadsheet row i + 1 (same convention as the xlsx-based product importer). */
export type DownloadImportGrid = DownloadImportCell[][];

/** Trim whitespace and a stray leading/trailing comma left over from splitting a comma-separated cell. */
export function cleanDownloadName(raw: string): string {
  return raw
    .trim()
    .replace(/^,+\s*/, "")
    .replace(/,+\s*$/, "")
    .trim();
}

export type ResolvedDownloadColumns = { columns: number[]; names: string[] };

/**
 * Given the row number of the merged "Downloads" banner cell, find which columns it spans
 * (via that cell's colspan) and read the real sub-category names from the row right after it.
 */
export function resolveDownloadColumns(
  grid: DownloadImportGrid,
  bannerRowNumber: number
): { ok: true; result: ResolvedDownloadColumns } | { ok: false; error: string } {
  const bannerRow = grid[bannerRowNumber - 1];
  if (!bannerRow) return { ok: false, error: `Row ${bannerRowNumber} was not found in the sheet.` };

  let anchorCol = -1;
  let span = 1;
  for (let col = 0; col < bannerRow.length; col++) {
    const cell = bannerRow[col];
    if (cell && cell.text.trim().toLowerCase() === "downloads") {
      anchorCol = col;
      span = cell.colSpan ?? 1;
      break;
    }
  }
  if (anchorCol === -1) {
    return { ok: false, error: `No "Downloads" header was found in row ${bannerRowNumber}.` };
  }

  const subHeaderRow = grid[bannerRowNumber] ?? [];
  const columns = Array.from({ length: span }, (_, i) => anchorCol + i);
  const names = columns.map((c) => (subHeaderRow[c]?.text ?? "").trim() || `Column ${excelColumnLabel(c)}`);
  return { ok: true, result: { columns, names } };
}
