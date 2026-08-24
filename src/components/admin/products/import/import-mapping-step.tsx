"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { excelColumnLabel } from "@/lib/excel-columns";
import { PRODUCT_ATTRIBUTES, PRODUCT_FAMILIES } from "@/lib/product-constants";
import type { ColumnDestination } from "@/lib/variable-product-import";
import type { MatchBy, ClassificationFieldState, ClassificationState, CompanyOption, IndustryOption } from "./types";

const MULTI_USE: ReadonlySet<ColumnDestination> = new Set(["ignore"]);

const BASE_DESTINATIONS: { value: ColumnDestination; label: string }[] = [
  { value: "ignore", label: "— Ignore —" },
  { value: "modelNumber", label: "Model Number" },
  { value: "name", label: "Product Name" },
  { value: "image", label: "Product Image" },
  { value: "certificates", label: "Certificates" },
  { value: "features", label: "Features" },
  ...PRODUCT_ATTRIBUTES.map((a) => ({ value: a.key as ColumnDestination, label: a.label })),
];

type ClassificationFieldKey = Exclude<keyof ClassificationState, "categoryMatchBy" | "subCategoryMatchBy">;

const CLASSIFICATION_DESTINATIONS: { value: ColumnDestination; label: string; field: ClassificationFieldKey }[] = [
  { value: "category", label: "Category", field: "category" },
  { value: "subCategory", label: "Sub-Category", field: "subCategory" },
  { value: "productFamily", label: "Product Family", field: "productFamily" },
  { value: "industry", label: "Industry", field: "industry" },
  { value: "subIndustry", label: "Sub-Industry", field: "subIndustry" },
];

function PlainSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as string)}>
      <SelectTrigger className={cn("h-8 w-full text-xs", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const MATCH_BY_OPTIONS: { value: MatchBy; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "importReference", label: "Import Reference" },
];

function MatchByToggle({ value, onChange }: { value: MatchBy; onChange: (v: MatchBy) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
      <span className="text-xs font-medium text-muted-foreground">Match by:</span>
      <div className="flex gap-1">
        {MATCH_BY_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            size="xs"
            variant={value === opt.value ? "secondary" : "outline"}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ClassificationFieldControl({
  label,
  state,
  onChange,
  allowNone,
  fixedOptions,
}: {
  label: string;
  state: ClassificationFieldState;
  onChange: (next: ClassificationFieldState) => void;
  allowNone: boolean;
  fixedOptions: { value: string; label: string }[];
}) {
  const modes: { value: "fixed" | "mapped" | "none"; label: string }[] = [
    { value: "fixed", label: "Fixed value" },
    { value: "mapped", label: "Map column" },
    ...(allowNone ? ([{ value: "none", label: "None" }] as const) : []),
  ];

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex gap-1">
          {modes.map((m) => (
            <Button
              key={m.value}
              type="button"
              size="xs"
              variant={state.mode === m.value ? "secondary" : "outline"}
              onClick={() => onChange({ mode: m.value, fixedValue: m.value === "fixed" ? state.fixedValue : null })}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>
      {state.mode === "fixed" && (
        <PlainSelect
          value={state.fixedValue ?? ""}
          onValueChange={(v) => onChange({ ...state, fixedValue: v })}
          options={fixedOptions}
          placeholder={`Choose ${label.toLowerCase()}...`}
        />
      )}
      {state.mode === "mapped" && (
        <p className="text-xs text-muted-foreground">
          Assign the &ldquo;{label}&rdquo; destination to a column in the table below.
        </p>
      )}
      {state.mode === "none" && <p className="text-xs text-muted-foreground">Left blank for every product.</p>}
    </div>
  );
}

export function ImportMappingStep({
  grid,
  headerRow,
  columnDestinations,
  onColumnDestinationsChange,
  classification,
  onClassificationChange,
  companies,
  industries,
  error,
  onBack,
  onNext,
}: {
  grid: string[][];
  headerRow: number;
  columnDestinations: Record<number, ColumnDestination>;
  onColumnDestinationsChange: (next: Record<number, ColumnDestination>) => void;
  classification: ClassificationState;
  onClassificationChange: (next: ClassificationState) => void;
  companies: CompanyOption[];
  industries: IndustryOption[];
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

  function setField(field: ClassificationFieldKey, next: ClassificationFieldState) {
    onClassificationChange({ ...classification, [field]: next });
  }

  function findCategoryOwner(categoryId: string) {
    return companies.find((c) => c.categories.some((cat) => cat.id === categoryId));
  }
  function findIndustryById(industryId: string) {
    return industries.find((i) => i.id === industryId);
  }

  const categoryOptions = companies.flatMap((c) =>
    c.categories.map((cat) => ({ value: cat.id, label: `${c.name} — ${cat.name}` }))
  );

  const subCategoryOptions = (() => {
    if (classification.category.mode === "fixed" && classification.category.fixedValue) {
      const owner = findCategoryOwner(classification.category.fixedValue);
      const category = owner?.categories.find((c) => c.id === classification.category.fixedValue);
      return (category?.subCategories ?? []).map((s) => ({ value: s.id, label: s.name }));
    }
    return companies.flatMap((c) =>
      c.categories.flatMap((cat) =>
        cat.subCategories.map((s) => ({ value: s.id, label: `${c.name} — ${cat.name} — ${s.name}` }))
      )
    );
  })();

  const productFamilyOptions = PRODUCT_FAMILIES.map((f) => ({ value: f, label: f }));
  const industryOptions = industries.map((i) => ({ value: i.id, label: i.name }));

  const subIndustryOptions = (() => {
    if (classification.industry.mode === "fixed" && classification.industry.fixedValue) {
      const industry = findIndustryById(classification.industry.fixedValue);
      return (industry?.subIndustries ?? []).map((s) => ({ value: s.id, label: s.name }));
    }
    return industries.flatMap((i) => i.subIndustries.map((s) => ({ value: s.id, label: `${i.name} — ${s.name}` })));
  })();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>3. Batch defaults</CardTitle>
          <CardDescription>
            For each field, either set one fixed value for every product in this upload, or map it to a spreadsheet
            column. Company is set automatically from the matched Category.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <ClassificationFieldControl
              label="Category"
              state={classification.category}
              onChange={(next) => setField("category", next)}
              allowNone={false}
              fixedOptions={categoryOptions}
            />
            {classification.category.mode === "mapped" && (
              <MatchByToggle
                value={classification.categoryMatchBy}
                onChange={(v) => onClassificationChange({ ...classification, categoryMatchBy: v })}
              />
            )}
          </div>
          <div className="space-y-2">
            <ClassificationFieldControl
              label="Sub-Category"
              state={classification.subCategory}
              onChange={(next) => setField("subCategory", next)}
              allowNone
              fixedOptions={subCategoryOptions}
            />
            {classification.subCategory.mode === "mapped" && (
              <MatchByToggle
                value={classification.subCategoryMatchBy}
                onChange={(v) => onClassificationChange({ ...classification, subCategoryMatchBy: v })}
              />
            )}
          </div>
          <ClassificationFieldControl
            label="Product Family"
            state={classification.productFamily}
            onChange={(next) => setField("productFamily", next)}
            allowNone={false}
            fixedOptions={productFamilyOptions}
          />
          <ClassificationFieldControl
            label="Industry"
            state={classification.industry}
            onChange={(next) => setField("industry", next)}
            allowNone
            fixedOptions={industryOptions}
          />
          <ClassificationFieldControl
            label="Sub-Industry"
            state={classification.subIndustry}
            onChange={(next) => setField("subIndustry", next)}
            allowNone
            fixedOptions={subIndustryOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Column mapping</CardTitle>
          <CardDescription>Map each spreadsheet column to a product field.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
    </div>
  );
}
