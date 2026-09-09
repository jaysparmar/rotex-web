"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { splitReferences } from "@/lib/variable-product-import";
import { PlainSelect } from "./plain-select";
import type { IndustryOption, SubIndustryOption, IndustryReferenceRowState, SubIndustryReferenceRowState } from "./types";

const CREATE_NEW = "__create__";

function collectDistinctTokens(grid: string[][], headerRow: number, column: number): string[] {
  const seen = new Map<string, string>();
  for (const row of grid.slice(headerRow)) {
    for (const token of splitReferences(row[column] ?? "")) {
      const key = token.toLowerCase();
      if (!seen.has(key)) seen.set(key, token);
    }
  }
  return [...seen.values()];
}

function seedIndustryRows(tokens: string[], industries: IndustryOption[]): IndustryReferenceRowState[] {
  return tokens.map((reference) => {
    const match = industries.find((i) => i.importReference?.trim().toLowerCase() === reference.toLowerCase());
    return match
      ? { reference, mode: "existing", industryId: match.id, name: match.name }
      : { reference, mode: "create", industryId: null, name: reference };
  });
}

function seedSubIndustryRows(tokens: string[], subIndustries: SubIndustryOption[]): SubIndustryReferenceRowState[] {
  return tokens.map((reference) => {
    const match = subIndustries.find((s) => s.importReference?.trim().toLowerCase() === reference.toLowerCase());
    return match
      ? { reference, mode: "existing", subIndustryId: match.id, name: match.name, parentIndustryReference: "" }
      : { reference, mode: "create", subIndustryId: null, name: reference, parentIndustryReference: "" };
  });
}

export function ImportIndustriesStep({
  grid,
  headerRow,
  industryColumn,
  subIndustryColumn,
  industries,
  subIndustries,
  industryRows,
  onIndustryRowsChange,
  subIndustryRows,
  onSubIndustryRowsChange,
  error,
  onBack,
  onNext,
}: {
  grid: string[][];
  headerRow: number;
  industryColumn: number | null;
  subIndustryColumn: number | null;
  industries: IndustryOption[];
  subIndustries: SubIndustryOption[];
  industryRows: IndustryReferenceRowState[];
  onIndustryRowsChange: (next: IndustryReferenceRowState[]) => void;
  subIndustryRows: SubIndustryReferenceRowState[];
  onSubIndustryRowsChange: (next: SubIndustryReferenceRowState[]) => void;
  error?: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const industryTokens = industryColumn != null ? collectDistinctTokens(grid, headerRow, industryColumn) : [];
  const subIndustryTokens = subIndustryColumn != null ? collectDistinctTokens(grid, headerRow, subIndustryColumn) : [];
  const industryTokensKey = industryTokens.join("|");
  const subIndustryTokensKey = subIndustryTokens.join("|");

  useEffect(() => {
    if (industryColumn != null) onIndustryRowsChange(seedIndustryRows(industryTokens, industries));
    // Re-seed only when the detected token set changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industryTokensKey, industryColumn]);

  useEffect(() => {
    if (subIndustryColumn != null) onSubIndustryRowsChange(seedSubIndustryRows(subIndustryTokens, subIndustries));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subIndustryTokensKey, subIndustryColumn]);

  if (industryColumn == null && subIndustryColumn == null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Map industries</CardTitle>
          <CardDescription>
            No column is mapped to Industry or Sub-Industry — nothing to configure here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <Button type="button" variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
            <Button type="button" size="sm" onClick={onNext}>
              Next: Map Downloads
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  function setIndustryRow(i: number, next: IndustryReferenceRowState) {
    const nextRows = [...industryRows];
    nextRows[i] = next;
    onIndustryRowsChange(nextRows);
  }

  function setSubIndustryRow(i: number, next: SubIndustryReferenceRowState) {
    const nextRows = [...subIndustryRows];
    nextRows[i] = next;
    onSubIndustryRowsChange(nextRows);
  }

  const industryOptions = [
    { value: CREATE_NEW, label: "— Create new industry —" },
    ...industries.map((i) => ({ value: i.id, label: i.name })),
  ];
  const subIndustryOptions = [
    { value: CREATE_NEW, label: "— Create new sub-industry —" },
    ...subIndustries.map((s) => ({ value: s.id, label: s.name })),
  ];
  // A new sub-industry's parent can be an existing industry, or one being created in this same step.
  const parentIndustryOptions = [
    ...industries.map((i) => ({ value: i.importReference ?? "", label: i.name })).filter((o) => o.value),
    ...industryRows
      .filter((r) => r.mode === "create")
      .map((r) => ({ value: r.reference, label: `${r.name} (new)` })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map industries</CardTitle>
        <CardDescription>
          Match each detected reference to an existing Industry/Sub-Industry, or create a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {industryColumn != null && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Industries</p>
            {industryRows.map((row, i) => (
              <div key={row.reference} className="space-y-2 rounded-lg border border-border p-3">
                <span className="text-sm font-medium">{row.reference}</span>
                <PlainSelect
                  value={row.mode === "create" ? CREATE_NEW : row.industryId ?? CREATE_NEW}
                  onValueChange={(v) =>
                    setIndustryRow(
                      i,
                      v === CREATE_NEW
                        ? { ...row, mode: "create", industryId: null }
                        : { ...row, mode: "existing", industryId: v }
                    )
                  }
                  options={industryOptions}
                />
                {row.mode === "create" && (
                  <Field label="Name">
                    <Input
                      value={row.name}
                      onChange={(e) => setIndustryRow(i, { ...row, name: e.target.value })}
                      className="h-9"
                    />
                  </Field>
                )}
              </div>
            ))}
          </div>
        )}

        {subIndustryColumn != null && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Sub-Industries</p>
            {subIndustryRows.map((row, i) => (
              <div key={row.reference} className="space-y-2 rounded-lg border border-border p-3">
                <span className="text-sm font-medium">{row.reference}</span>
                <PlainSelect
                  value={row.mode === "create" ? CREATE_NEW : row.subIndustryId ?? CREATE_NEW}
                  onValueChange={(v) =>
                    setSubIndustryRow(
                      i,
                      v === CREATE_NEW
                        ? { ...row, mode: "create", subIndustryId: null }
                        : { ...row, mode: "existing", subIndustryId: v }
                    )
                  }
                  options={subIndustryOptions}
                />
                {row.mode === "create" && (
                  <>
                    <Field label="Name">
                      <Input
                        value={row.name}
                        onChange={(e) => setSubIndustryRow(i, { ...row, name: e.target.value })}
                        className="h-9"
                      />
                    </Field>
                    <Field label="Parent Industry">
                      <PlainSelect
                        value={row.parentIndustryReference}
                        onValueChange={(v) => setSubIndustryRow(i, { ...row, parentIndustryReference: v })}
                        options={parentIndustryOptions}
                        placeholder="Choose parent industry..."
                      />
                    </Field>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            Next: Map Downloads
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
