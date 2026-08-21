"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { excelColumnLabel } from "@/lib/excel-columns";

export function ImportSpecificationsStep({
  grid,
  headerRow,
  specificationColumns,
  onChange,
  onBack,
  onNext,
}: {
  grid: string[][];
  headerRow: number;
  specificationColumns: number[];
  onChange: (next: number[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const headerValues = grid[headerRow - 1] ?? [];
  const dataRows = grid.slice(headerRow, headerRow + 50);
  const columnCount = grid.reduce((max, row) => Math.max(max, row.length), 0);

  function columnLabel(col: number) {
    return (headerValues[col] ?? "").trim() || excelColumnLabel(col);
  }

  function sampleValue(col: number) {
    for (const row of dataRows) {
      const v = (row[col] ?? "").trim();
      if (v) return v;
    }
    return "";
  }

  const selected = new Set(specificationColumns);

  function toggle(col: number) {
    const next = new Set(selected);
    if (next.has(col)) next.delete(col);
    else next.add(col);
    onChange([...next].sort((a, b) => a - b));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>5. Specifications</CardTitle>
        <CardDescription>
          Select any number of columns to include as specifications. Each selected column becomes one spec entry per
          variant — the key is that column&apos;s header label, the value is the cell for that row.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-[32rem] overflow-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border bg-muted/30">
                <th className="w-10 px-2 py-1.5 font-medium text-muted-foreground"></th>
                <th className="px-2 py-1.5 font-medium text-muted-foreground">Column</th>
                <th className="px-2 py-1.5 font-medium text-muted-foreground">Sample value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: columnCount }).map((_, col) => (
                <tr
                  key={col}
                  className="cursor-pointer hover:bg-muted/20"
                  onClick={() => toggle(col)}
                >
                  <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(col)} onCheckedChange={() => toggle(col)} />
                  </td>
                  <td className="px-2 py-1.5 font-medium">{columnLabel(col)}</td>
                  <td className="max-w-96 truncate px-2 py-1.5 text-muted-foreground">{sampleValue(col)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">{selected.size} column{selected.size === 1 ? "" : "s"} selected</p>

        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            Next: Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
