"use client";

import { CircleCheck, CircleAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { excelColumnLabel } from "@/lib/excel-columns";
import type { ColumnDestination } from "@/lib/variable-product-import";
import { PlainSelect } from "./plain-select";
import { BASE_DESTINATIONS, CLASSIFICATION_DESTINATIONS, type ClassificationState } from "./types";

const MULTI_USE: ReadonlySet<ColumnDestination> = new Set(["ignore"]);

export function ImportColumnMappingStep({
  grid,
  headerRow,
  columnDestinations,
  onColumnDestinationsChange,
  classification,
  error,
  onBack,
  onNext,
}: {
  grid: string[][];
  headerRow: number;
  columnDestinations: Record<number, ColumnDestination>;
  onColumnDestinationsChange: (next: Record<number, ColumnDestination>) => void;
  classification: ClassificationState;
  error?: string;
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

  function usedElsewhere(dest: ColumnDestination, col: number): number | undefined {
    for (const [c, d] of Object.entries(columnDestinations)) {
      if (d === dest && Number(c) !== col) return Number(c);
    }
    return undefined;
  }

  function isDestinationMapped(dest: ColumnDestination): boolean {
    return Object.values(columnDestinations).includes(dest);
  }

  const modelNumberMapped = isDestinationMapped("modelNumber");

  const activeClassificationDestinations = CLASSIFICATION_DESTINATIONS.filter(
    (d) => classification[d.field].mode === "mapped"
  );
  const allDestinations = [...BASE_DESTINATIONS, ...activeClassificationDestinations];

  function destinationOptions(col: number) {
    return allDestinations.map((d) => {
      if (MULTI_USE.has(d.value)) return { value: d.value, label: d.label };
      const usedAt = usedElsewhere(d.value, col);
      return {
        value: d.value,
        label: usedAt != null ? `${d.label} (on ${columnLabel(usedAt)})` : d.label,
        disabled: usedAt != null,
      };
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Column mapping</CardTitle>
        <CardDescription>Map each spreadsheet column to a product field.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs">
          {modelNumberMapped ? (
            <>
              <CircleCheck className="size-3.5 shrink-0 text-success" />
              <span className="text-muted-foreground">Model Number is mapped.</span>
            </>
          ) : (
            <>
              <CircleAlert className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Model Number (required) must be mapped to a column below.</span>
            </>
          )}
        </div>

        <div className="max-h-[32rem] overflow-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border bg-muted/30">
                <th className="px-2 py-1.5 font-medium text-muted-foreground">Column</th>
                <th className="px-2 py-1.5 font-medium text-muted-foreground">Sample value</th>
                <th className="w-56 px-2 py-1.5 font-medium text-muted-foreground">Maps to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: columnCount }).map((_, col) => (
                <tr key={col}>
                  <td className="px-2 py-1.5 font-medium">{columnLabel(col)}</td>
                  <td className="max-w-56 truncate px-2 py-1.5 text-muted-foreground">{sampleValue(col)}</td>
                  <td className="px-2 py-1.5">
                    <PlainSelect
                      value={columnDestinations[col] ?? "ignore"}
                      onValueChange={(v) =>
                        onColumnDestinationsChange({ ...columnDestinations, [col]: v as ColumnDestination })
                      }
                      options={destinationOptions(col)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            Next: Specifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
