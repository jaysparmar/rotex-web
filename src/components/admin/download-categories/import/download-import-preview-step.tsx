"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DownloadImportSummary } from "@/lib/download-import";

const LIST_DISPLAY_LIMIT = 50;

type CommitResult = { createdCategoryCount: number; updatedTargetCount: number; addedEntryCount: number };

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function DownloadImportPreviewStep({
  summary,
  loading,
  committing,
  committedResult,
  onBack,
  onRefreshPreview,
  onCommit,
}: {
  summary: DownloadImportSummary | null;
  loading: boolean;
  committing: boolean;
  committedResult: CommitResult | null;
  onBack: () => void;
  onRefreshPreview: () => void;
  onCommit: () => void;
}) {
  if (loading || !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Nothing is written to the database until you confirm.</CardDescription>
        </CardHeader>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">Analyzing sheet...</CardContent>
      </Card>
    );
  }

  if (committedResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import complete</CardTitle>
          <CardDescription>The products and variants below were updated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Categories created" value={committedResult.createdCategoryCount} />
            <StatTile label="Products/variants updated" value={committedResult.updatedTargetCount} />
            <StatTile label="Downloads added" value={committedResult.addedEntryCount} />
          </div>
          <Link href="/admin/download-categories">
            <Button type="button" size="sm">
              View Download Categories
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const nothingToDo = summary.entriesToAdd === 0;
  const shownEntries = summary.entries.slice(0, LIST_DISPLAY_LIMIT);
  const shownErrors = summary.errors.slice(0, LIST_DISPLAY_LIMIT);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Nothing is written to the database until you confirm.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Categories to create" value={summary.categoriesToCreate.length} />
            <StatTile label="Products/variants to update" value={summary.targetsToUpdate} />
            <StatTile label="Downloads to add" value={summary.entriesToAdd} />
            <StatTile label="Skipped (empty after trim)" value={summary.skippedEmpty} />
          </div>

          {summary.categoriesToCreate.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-sm font-medium">New categories that will be created</div>
              <div className="flex flex-wrap gap-1.5">
                {summary.categoriesToCreate.map((name) => (
                  <Badge key={name} variant="outline">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {summary.entries.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-sm font-medium">Downloads to add</div>
              <div className="max-h-72 overflow-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Row</th>
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Model Number</th>
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Variant</th>
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Category</th>
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Name</th>
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {shownEntries.map((e, i) => (
                      <tr key={i}>
                        <td className="px-2 py-1.5">{e.rowNumber}</td>
                        <td className="px-2 py-1.5">{e.modelNumber}</td>
                        <td className="px-2 py-1.5">{e.variantLabel || "—"}</td>
                        <td className="px-2 py-1.5">{e.categoryName}</td>
                        <td className="px-2 py-1.5">{e.title}</td>
                        <td className="max-w-56 truncate px-2 py-1.5">
                          <a href={e.url} target="_blank" rel="noreferrer" className="text-primary underline">
                            {e.url}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {summary.entries.length > LIST_DISPLAY_LIMIT && (
                <p className="text-xs text-muted-foreground">+{summary.entries.length - LIST_DISPLAY_LIMIT} more</p>
              )}
            </div>
          )}

          {summary.errors.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-destructive">
                {summary.errors.length} row{summary.errors.length === 1 ? "" : "s"} will be skipped
              </div>
              <div className="max-h-56 overflow-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Row</th>
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Model Number</th>
                      <th className="px-2 py-1.5 font-medium text-muted-foreground">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {shownErrors.map((e, i) => (
                      <tr key={i}>
                        <td className="px-2 py-1.5">{e.rowNumber || "—"}</td>
                        <td className="px-2 py-1.5">{e.modelNumber ?? "—"}</td>
                        <td className="px-2 py-1.5">{e.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {summary.errors.length > LIST_DISPLAY_LIMIT && (
                <p className="text-xs text-muted-foreground">+{summary.errors.length - LIST_DISPLAY_LIMIT} more</p>
              )}
            </div>
          )}

          {nothingToDo && (
            <p className="text-sm text-muted-foreground">
              Nothing to import with the current mapping — go back and adjust it.
            </p>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onRefreshPreview}>
                Re-run preview
              </Button>
              <Button type="button" size="sm" disabled={nothingToDo || committing} onClick={onCommit}>
                {committing ? "Importing..." : "Confirm & Import"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
