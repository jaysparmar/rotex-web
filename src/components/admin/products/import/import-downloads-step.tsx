"use client";

import { useEffect } from "react";
import { CircleCheck, CircleAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { excelColumnLabel } from "@/lib/excel-columns";
import {
  resolveDownloadColumns,
  computeDefaultCategoryColumns,
  type DownloadImportGrid,
  type CategoryColumnState,
  type DownloadCategoryOption,
} from "@/lib/download-grid";
import type { DownloadCategoryMatchBy } from "@/lib/download-import";
import { PlainSelect } from "./plain-select";

const CREATE_NEW = "__create__";

function findMatch(
  headerText: string,
  matchBy: DownloadCategoryMatchBy,
  categories: DownloadCategoryOption[]
): string | null {
  const needle = headerText.trim().toLowerCase();
  if (!needle) return null;
  const match =
    matchBy === "importReference"
      ? categories.find((c) => c.importReference?.trim().toLowerCase() === needle)
      : categories.find((c) => c.name.toLowerCase() === needle);
  return match?.id ?? null;
}

export function ImportDownloadsStep({
  richGrid,
  categories,
  bannerRow,
  onBannerRowChange,
  categoryColumns,
  onCategoryColumnsChange,
  error,
  onBack,
  onNext,
}: {
  richGrid: DownloadImportGrid;
  categories: DownloadCategoryOption[];
  bannerRow: number;
  onBannerRowChange: (row: number) => void;
  categoryColumns: CategoryColumnState[];
  onCategoryColumnsChange: (next: CategoryColumnState[]) => void;
  error?: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const resolved = bannerRow > 0 ? resolveDownloadColumns(richGrid, bannerRow) : null;
  const resolvedColumnsKey = resolved?.ok ? resolved.result.columns.join(",") : "";

  useEffect(() => {
    if (resolved?.ok) {
      onCategoryColumnsChange(computeDefaultCategoryColumns(resolved.result.columns, resolved.result.names, categories));
    }
    // Re-seed only when the detected column set actually changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedColumnsKey]);

  function setRow(i: number, next: CategoryColumnState) {
    const nextState = [...categoryColumns];
    nextState[i] = next;
    onCategoryColumnsChange(nextState);
  }

  const categoryOptions = [
    { value: CREATE_NEW, label: "— Create new category —" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map downloads</CardTitle>
        <CardDescription>
          Optional — only needed if this sheet has a merged &quot;Downloads&quot; header with links. Leave the row
          number at 0 to skip.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Field label='"Downloads" banner row number (0 to skip)'>
          <Input
            type="number"
            min={0}
            className="h-9 w-40"
            value={bannerRow || ""}
            onChange={(e) => onBannerRowChange(Math.max(0, Number(e.target.value) || 0))}
          />
        </Field>

        {bannerRow > 0 && (
          <div className="rounded-lg border border-border p-3">
            {!resolved?.ok ? (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <CircleAlert className="size-3.5 shrink-0" />
                {resolved?.error ?? "Enter a valid banner row number."}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CircleCheck className="size-3.5 shrink-0 text-success" />
                  Detected columns {excelColumnLabel(resolved.result.columns[0])}
                  {resolved.result.columns.length > 1
                    ? `–${excelColumnLabel(resolved.result.columns[resolved.result.columns.length - 1])}`
                    : ""}{" "}
                  from row {bannerRow + 1}:
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
        )}

        {bannerRow > 0 && resolved?.ok && (
          <div className="space-y-3">
            {resolved.result.columns.map((col, i) => {
              const row = categoryColumns[i];
              if (!row) return null;
              return (
                <div key={col} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{row.headerText}</span>
                    <Tabs
                      value={row.matchBy}
                      onValueChange={(v) => {
                        const matchBy = v as DownloadCategoryMatchBy;
                        const matchId = findMatch(row.headerText, matchBy, categories);
                        setRow(i, { ...row, matchBy, mode: matchId ? "existing" : "create", categoryId: matchId });
                      }}
                    >
                      <TabsList>
                        <TabsTrigger value="name">Name</TabsTrigger>
                        <TabsTrigger value="importReference">Import Reference</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <PlainSelect
                    value={row.mode === "create" ? CREATE_NEW : row.categoryId ?? CREATE_NEW}
                    onValueChange={(v) =>
                      setRow(
                        i,
                        v === CREATE_NEW
                          ? { ...row, mode: "create", categoryId: null }
                          : { ...row, mode: "existing", categoryId: v }
                      )
                    }
                    options={categoryOptions}
                  />
                  {row.mode === "create" && (
                    <p className="text-xs text-muted-foreground">
                      Will create a new Download Category named &quot;{row.headerText}&quot;
                      {row.matchBy === "importReference"
                        ? ` with "${row.headerText}" set as its import reference.`
                        : "."}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button type="button" size="sm" disabled={bannerRow > 0 && !resolved?.ok} onClick={onNext}>
            {bannerRow > 0 ? "Next: Specifications" : "Skip: Next: Specifications"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
