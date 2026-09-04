"use client";

import { useMemo, useState } from "react";
import { CircleAlert, ListChecks, Search, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { excelColumnLabel } from "@/lib/excel-columns";
import type { ColumnDestination } from "@/lib/variable-product-import";
import { destinationLabel } from "./types";

export function ImportSpecificationsStep({
  grid,
  headerRow,
  columnDestinations,
  specificationColumns,
  onChange,
  onBack,
  onNext,
}: {
  grid: string[][];
  headerRow: number;
  columnDestinations: Record<number, ColumnDestination>;
  specificationColumns: number[];
  onChange: (next: number[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [search, setSearch] = useState("");
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

  const allColumns = useMemo(() => Array.from({ length: columnCount }, (_, col) => col), [columnCount]);

  const visibleColumns = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allColumns;
    return allColumns.filter((col) => columnLabel(col).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allColumns, search, headerValues]);

  const alreadyMappedCols = useMemo(
    () => new Set(Object.keys(columnDestinations).map(Number).filter((c) => columnDestinations[c] !== "ignore")),
    [columnDestinations]
  );

  const duplicateLabels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const col of specificationColumns) {
      const label = columnLabel(col);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([label]) => label));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificationColumns, headerValues]);

  function selectAllVisible() {
    onChange([...new Set([...selected, ...visibleColumns])].sort((a, b) => a - b));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
        <CardDescription>
          Select any number of columns to include as specifications. Each selected column becomes one spec entry per
          variant — the key is that column&apos;s header label, the value is the cell for that row.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter columns..."
              className="h-8 pl-8 text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear filter"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="gap-1">
              <ListChecks className="size-3" />
              {selected.size} selected
            </Badge>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={selectAllVisible}>
              Select {search ? "filtered" : "all"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={clearAll}
              disabled={selected.size === 0}
            >
              Clear
            </Button>
          </div>
        </div>

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
              {visibleColumns.map((col) => {
                const isSelected = selected.has(col);
                const mappedDest = alreadyMappedCols.has(col) ? columnDestinations[col] : undefined;
                const label = columnLabel(col);
                const isDuplicate = isSelected && duplicateLabels.has(label);
                return (
                  <tr
                    key={col}
                    className={`cursor-pointer transition-colors hover:bg-muted/20 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                    onClick={() => toggle(col)}
                  >
                    <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onCheckedChange={() => toggle(col)} />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium">{label}</span>
                        {mappedDest && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            also mapped: {destinationLabel(mappedDest)}
                          </Badge>
                        )}
                        {isDuplicate && (
                          <Badge variant="destructive" className="gap-1 text-[10px]">
                            <CircleAlert className="size-2.5" />
                            duplicate key
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="max-w-96 truncate px-2 py-1.5 text-muted-foreground">{sampleValue(col)}</td>
                  </tr>
                );
              })}
              {visibleColumns.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-6 text-center text-muted-foreground">
                    No columns match &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {duplicateLabels.size > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <CircleAlert className="size-3.5 shrink-0" />
            Some selected columns share the same header label — they will overwrite each other as spec keys.
          </p>
        )}

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
