"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_ATTRIBUTES } from "@/lib/product-constants";
import type { VariableImportSummary } from "@/lib/variable-product-import";

const ERROR_DISPLAY_LIMIT = 50;

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function ImportPreviewStep({
  summary,
  loading,
  committing,
  committedResult,
  onBack,
  onRefreshPreview,
  onCommit,
}: {
  summary: VariableImportSummary | null;
  loading: boolean;
  committing: boolean;
  committedResult: { createdProductCount: number; createdVariantCount: number; createdAttributeValueCount: number } | null;
  onBack: () => void;
  onRefreshPreview: () => void;
  onCommit: () => void;
}) {
  if (loading || !summary) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Analyzing spreadsheet...
        </CardContent>
      </Card>
    );
  }

  if (committedResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import complete</CardTitle>
          <CardDescription>The products below were created or updated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Products created" value={committedResult.createdProductCount} />
            <StatTile label="Variants created" value={committedResult.createdVariantCount} />
            <StatTile label="Attribute values added" value={committedResult.createdAttributeValueCount} />
          </div>
          <Link href="/admin/products">
            <Button type="button" size="sm">
              View Products
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const attrLabel = (key: string) => PRODUCT_ATTRIBUTES.find((a) => a.key === key)?.label ?? key;
  const nothingToDo = summary.productsToCreate === 0 && summary.variantsToCreate === 0;
  const shownErrors = summary.errors.slice(0, ERROR_DISPLAY_LIMIT);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>5. Preview</CardTitle>
          <CardDescription>Nothing is written to the database until you confirm.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Products to create" value={summary.productsToCreate} />
            <StatTile label="Products reused" value={summary.productsReused} />
            <StatTile label="Variants to create" value={summary.variantsToCreate} />
            <StatTile label="Variants skipped (duplicate)" value={summary.variantsSkipped} />
          </div>

          {summary.newAttributeValues.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-sm font-medium">New attribute values that will be added</div>
              <div className="flex flex-wrap gap-1.5">
                {summary.newAttributeValues.map((v, i) => (
                  <Badge key={i} variant="outline">
                    {attrLabel(v.attribute)}: {v.value}
                  </Badge>
                ))}
              </div>
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
              {summary.errors.length > ERROR_DISPLAY_LIMIT && (
                <p className="text-xs text-muted-foreground">
                  +{summary.errors.length - ERROR_DISPLAY_LIMIT} more
                </p>
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
