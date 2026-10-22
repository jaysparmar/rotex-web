/** 0-based column index -> spreadsheet-style letters ("A", "B", ..., "Z", "AA", ...). */
export function excelColumnLabel(index: number): string {
  let n = index + 1;
  let label = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

/**
 * Display label for every column of an import sheet, taken from the header row. A blank or
 * repeated header (e.g. several columns all called "Options" under per-column banners like
 * "Body Material" / "Seal Material") falls back to the row above it — walking left through
 * merged-cell holes to the banner's anchor — and finally to the column letters.
 */
export function importColumnLabels(grid: (string | null | undefined)[][], headerRow: number): string[] {
  const header = grid[headerRow - 1] ?? [];
  const above = headerRow > 1 ? (grid[headerRow - 2] ?? []) : [];
  const columnCount = grid.reduce((max, row) => Math.max(max, row.length), 0);

  const raw = Array.from({ length: columnCount }, (_, col) => (header[col] ?? "").trim());
  const counts = new Map<string, number>();
  for (const label of raw) if (label) counts.set(label, (counts.get(label) ?? 0) + 1);

  function aboveLabel(col: number): string {
    let c = col;
    while (c > 0 && above[c] == null) c--;
    return (above[c] ?? "").trim();
  }

  return raw.map((label, col) => {
    if (label && counts.get(label) === 1) return label;
    return aboveLabel(col) || label || excelColumnLabel(col);
  });
}
