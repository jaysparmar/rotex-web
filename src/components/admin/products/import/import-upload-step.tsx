"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field } from "@/components/admin/form-fields";
import { excelColumnLabel } from "@/lib/excel-columns";
import { adminFetch } from "@/lib/admin-fetch";
import type { DownloadImportGrid } from "@/lib/download-grid";

export function ImportUploadStep({
  grid,
  headerRow,
  onParsed,
  onHeaderRowChange,
  onNext,
}: {
  grid: string[][] | null;
  headerRow: number;
  onParsed: (grid: string[][], richGrid: DownloadImportGrid) => void;
  onHeaderRowChange: (row: number) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(undefined);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await adminFetch("/api/admin/products/import/parse", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed to parse file");
      onParsed(json.data.grid as string[][], json.data.richGrid as DownloadImportGrid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setLoading(false);
    }
  }

  const previewRows = grid ? grid.slice(0, headerRow + 5) : [];
  const columnCount = grid ? grid.reduce((max, row) => Math.max(max, row.length), 0) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload spreadsheet</CardTitle>
          <CardDescription>A Google Sheets HTML export (.html/.htm), one row per variant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".html,.htm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {loading ? "Parsing..." : grid ? "Replace file" : "Choose file"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {grid && (
        <Card>
          <CardHeader>
            <CardTitle>Header row</CardTitle>
            <CardDescription>Pick the row number that holds the column labels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Header row number">
              <Input
                type="number"
                min={1}
                className="h-9 w-40"
                value={headerRow}
                onChange={(e) => onHeaderRowChange(Math.max(1, Number(e.target.value) || 1))}
              />
            </Field>

            <div className="max-h-96 overflow-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-border bg-muted/30">
                    <th className="w-10 px-2 py-1.5 font-medium text-muted-foreground">#</th>
                    {Array.from({ length: columnCount }).map((_, i) => (
                      <th key={i} className="min-w-32 px-2 py-1.5 font-medium text-muted-foreground">
                        {excelColumnLabel(i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewRows.map((row, i) => {
                    const rowNumber = i + 1;
                    const isHeader = rowNumber === headerRow;
                    return (
                      <tr
                        key={i}
                        className={
                          isHeader
                            ? "bg-primary/10 font-medium"
                            : rowNumber < headerRow
                              ? "text-muted-foreground/50"
                              : ""
                        }
                      >
                        <td className="px-2 py-1.5">{rowNumber}</td>
                        {Array.from({ length: columnCount }).map((_, col) => (
                          <td key={col} className="max-w-48 truncate px-2 py-1.5">
                            {row[col] ?? ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={onNext}>
                Next: Map columns
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
