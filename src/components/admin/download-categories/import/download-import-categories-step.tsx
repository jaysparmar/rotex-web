"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlainSelect } from "@/components/admin/products/import/plain-select";
import type { DownloadCategoryMatchBy } from "@/lib/download-import";
import type { CategoryColumnState, DownloadCategoryOption } from "./types";

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

export function DownloadImportCategoriesStep({
  columns,
  categories,
  state,
  onChange,
  onBack,
  onNext,
}: {
  columns: number[];
  categories: DownloadCategoryOption[];
  state: CategoryColumnState[];
  onChange: (next: CategoryColumnState[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function setRow(i: number, next: CategoryColumnState) {
    const nextState = [...state];
    nextState[i] = next;
    onChange(nextState);
  }

  const categoryOptions = [
    { value: CREATE_NEW, label: "— Create new category —" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map categories</CardTitle>
        <CardDescription>
          Match each detected sub-category header to an existing Download Category, or create a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {columns.map((col, i) => {
          const row = state[i];
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
                value={row.mode === "create" ? CREATE_NEW : (row.categoryId ?? CREATE_NEW)}
                onValueChange={(v) =>
                  setRow(i, v === CREATE_NEW ? { ...row, mode: "create", categoryId: null } : { ...row, mode: "existing", categoryId: v })
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
