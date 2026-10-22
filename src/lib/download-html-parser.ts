import * as cheerio from "cheerio";
import type { DownloadImportCell, DownloadImportGrid } from "@/lib/download-grid";

/**
 * Parses a single-sheet Google Sheets "Download as Web Page (.html)" export into a dense grid.
 *
 * Google's export marks real spreadsheet rows with a row number — inside a `.row-header-wrapper`
 * in older exports, or as the text of the row's leading `<th>` in newer ones. The column-letter
 * header row and "freezebar" frozen-pane divider rows/cells carry no such number and are dropped
 * here so the remaining rows are a gap-free, 1-indexed sequence. Column indices account for
 * `colspan` (used only by merged header banners in practice) via a running cursor.
 */
export function parseDownloadsHtml(html: string): DownloadImportGrid {
  const $ = cheerio.load(html);
  const table = $("table").first();
  if (table.length === 0) return [];

  const rows: DownloadImportGrid = [];

  table.find("tr").each((_, trEl) => {
    const tr = $(trEl);
    const rowHeaderCell = tr.children("th").first();
    const rowHeaderText =
      tr.find(".row-header-wrapper").first().text().trim() || rowHeaderCell.text().trim();
    if (!/^\d+$/.test(rowHeaderText)) return;

    const cells: DownloadImportCell[] = [];
    let col = 0;
    tr.find("td, th").each((_, cellEl) => {
      const cell = $(cellEl);
      const cls = cell.attr("class") ?? "";
      if (cls.includes("freezebar-cell") || cls.includes("row-headers-background")) return;
      // Newer exports put the row number in the row's leading <th> — it isn't a sheet column.
      if (cellEl === rowHeaderCell.get(0)) return;

      const colSpan = parseInt(cell.attr("colspan") ?? "1", 10) || 1;
      const text = cell.text().trim();
      const links = cell
        .find("a")
        .toArray()
        .map((aEl) => {
          const a = $(aEl);
          return { text: a.text(), href: (a.attr("href") ?? "").trim() };
        });

      cells[col] = colSpan > 1 ? { text, links, colSpan } : { text, links };
      col += colSpan;
    });

    rows.push(cells);
  });

  return rows;
}
