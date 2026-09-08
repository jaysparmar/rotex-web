"use client";

import { CircleCheck, CircleAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { excelColumnLabel } from "@/lib/excel-columns";
import { resolveDownloadColumns } from "@/lib/download-grid";
import { PRODUCT_ATTRIBUTES } from "@/lib/product-constants";
import { PlainSelect } from "@/components/admin/products/import/plain-select";
import type { LocateState, WizardGrid } from "./types";

const NONE = "__none__";

function sampleValue(grid: WizardGrid, col: number): string {
  for (const row of grid.slice(0, 60)) {
    const v = (row[col]?.text ?? "").trim();
    if (v) return v;
  }
  return "";
}

export function DownloadImportLocateStep({
  grid,
  state,
  onChange,
  onBack,
  onNext,
}: {
  grid: WizardGrid;
  state: LocateState;
  onChange: (next: LocateState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const columnCount = grid.reduce((max, row) => Math.max(max, row.length), 0);
  const columnOptions = [
    { value: NONE, label: "— Not applicable —" },
    ...Array.from({ length: columnCount }, (_, col) => ({
      value: String(col),
      label: `${excelColumnLabel(col)}${sampleValue(grid, col) ? ` — ${sampleValue(grid, col)}` : ""}`,
    })),
  ];

  // Variant attribute headers (e.g. "Size") often live one row below the broader banner-row
  // category headers (e.g. "Valve Port Connection"), so label those dropdowns from that row
  // specifically instead of the generic "first non-empty cell" sample used above.
  const attributeHeaderRow = state.bannerRow > 0 ? grid[state.bannerRow] ?? [] : [];
  const attributeColumnOptions = [
    { value: NONE, label: "— Not applicable —" },
    ...Array.from({ length: columnCount }, (_, col) => {
      const label = (attributeHeaderRow[col]?.text ?? "").trim() || sampleValue(grid, col);
      return { value: String(col), label: `${excelColumnLabel(col)}${label ? ` — ${label}` : ""}` };
    }),
  ];

  const resolved = state.bannerRow > 0 ? resolveDownloadColumns(grid, state.bannerRow) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locate downloads</CardTitle>
        <CardDescription>
          Point at the Model Number column, the variant-identifying columns, and the row containing the merged
          &quot;Downloads&quot; header.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Model Number column">
            <PlainSelect
              value={state.modelNumberColumn != null ? String(state.modelNumberColumn) : ""}
              onValueChange={(v) => onChange({ ...state, modelNumberColumn: v ? Number(v) : null })}
              options={columnOptions.filter((o) => o.value !== NONE)}
              placeholder="Choose column..."
            />
          </Field>
          <Field label='"Downloads" banner row number'>
            <Input
              type="number"
              min={1}
              className="h-9"
              value={state.bannerRow || ""}
              onChange={(e) => onChange({ ...state, bannerRow: Math.max(1, Number(e.target.value) || 0) })}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Variant attribute columns</p>
          <p className="text-xs text-muted-foreground">
            Only needed for variable products, to find which specific variant a row belongs to. Leave &quot;Not
            applicable&quot; for attributes this sheet doesn&apos;t have.
            {state.bannerRow > 0 ? ` Column labels below are read from row ${state.bannerRow + 1}.` : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRODUCT_ATTRIBUTES.map((attr) => (
              <Field key={attr.key} label={attr.label}>
                <PlainSelect
                  value={state.attributeColumns[attr.key] != null ? String(state.attributeColumns[attr.key]) : NONE}
                  onValueChange={(v) =>
                    onChange({
                      ...state,
                      attributeColumns: { ...state.attributeColumns, [attr.key]: v === NONE ? undefined : Number(v) },
                    })
                  }
                  options={attributeColumnOptions}
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border p-3">
          {!resolved ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CircleAlert className="size-3.5 shrink-0" />
              Enter the banner row number to detect the Downloads columns.
            </div>
          ) : !resolved.ok ? (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <CircleAlert className="size-3.5 shrink-0" />
              {resolved.error}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CircleCheck className="size-3.5 shrink-0 text-success" />
                Detected columns {excelColumnLabel(resolved.result.columns[0])}
                {resolved.result.columns.length > 1
                  ? `–${excelColumnLabel(resolved.result.columns[resolved.result.columns.length - 1])}`
                  : ""}{" "}
                from row {state.bannerRow + 1}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resolved.result.names.map((name, i) => (
                  <Badge key={i} variant="outline">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={state.modelNumberColumn == null || !resolved?.ok}
            onClick={onNext}
          >
            Next: Map categories
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
