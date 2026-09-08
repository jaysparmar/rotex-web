"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { excelColumnLabel } from "@/lib/excel-columns";
import { adminFetch } from "@/lib/admin-fetch";
import type { WizardGrid } from "./types";

export function DownloadImportUploadStep({
  grid,
  onParsed,
  onNext,
}: {
  grid: WizardGrid | null;
  onParsed: (grid: WizardGrid) => void;
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
      const res = await adminFetch("/api/admin/download-categories/import/parse", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed to parse file");
      onParsed(json.data.grid as WizardGrid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setLoading(false);
    }
  }

  const previewRows = (grid ?? []).slice(0, 10);
  const columnCount = (grid ?? []).reduce((max, row) => Math.max(max, row.length), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload sheet export</CardTitle>
          <CardDescription>
            From Google Sheets: File → Download → Web page (.html). Only the first table in the file is read.
          </CardDescription>
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
            <CardTitle>Preview</CardTitle>
            <CardDescription>First 10 rows of the parsed sheet, row numbers as in the spreadsheet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  {previewRows.map((row, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1.5">{i + 1}</td>
                      {Array.from({ length: columnCount }).map((_, col) => (
                        <td key={col} className="max-w-48 truncate px-2 py-1.5">
                          {row[col]?.text ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={onNext}>
                Next: Locate downloads
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
