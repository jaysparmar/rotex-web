"use client";

import { CircleCheck, CircleAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCT_FAMILIES } from "@/lib/product-constants";
import type { ColumnDestination } from "@/lib/variable-product-import";
import { PlainSelect } from "./plain-select";
import type {
  MatchBy,
  ClassificationFieldState,
  ClassificationState,
  ClassificationFieldKey,
  CompanyOption,
  IndustryOption,
} from "./types";

const MATCH_BY_OPTIONS: { value: MatchBy; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "importReference", label: "Import Reference" },
];

function MatchByToggle({ value, onChange }: { value: MatchBy; onChange: (v: MatchBy) => void }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">Match by</span>
      <Tabs value={value} onValueChange={(v) => onChange(v as MatchBy)}>
        <TabsList className="w-full">
          {MATCH_BY_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value} className="flex-1">
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

function ClassificationFieldControl({
  label,
  state,
  onChange,
  allowNone,
  fixedOptions,
  required,
  incomplete,
  matchBy,
}: {
  label: string;
  state: ClassificationFieldState;
  onChange: (next: ClassificationFieldState) => void;
  allowNone: boolean;
  fixedOptions: { value: string; label: string }[];
  required: boolean;
  incomplete: boolean;
  matchBy?: { value: MatchBy; onChange: (v: MatchBy) => void };
}) {
  const modes: { value: "fixed" | "mapped" | "none"; label: string }[] = [
    { value: "fixed", label: "Fixed value" },
    { value: "mapped", label: "Map column" },
    ...(allowNone ? ([{ value: "none", label: "None" }] as const) : []),
  ];

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">({required ? "required" : "optional"})</span>
        </div>
        {incomplete ? (
          <CircleAlert className="size-4 shrink-0 text-muted-foreground" aria-label="Not set yet" />
        ) : (
          <CircleCheck className="size-4 shrink-0 text-success" aria-label="Configured" />
        )}
      </div>
      <Tabs
        value={state.mode}
        onValueChange={(v) =>
          onChange({ mode: v as "fixed" | "mapped" | "none", fixedValue: v === "fixed" ? state.fixedValue : null })
        }
      >
        <TabsList className="w-full">
          {modes.map((m) => (
            <TabsTrigger key={m.value} value={m.value} className="flex-1">
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {state.mode === "fixed" && (
        <PlainSelect
          value={state.fixedValue ?? ""}
          onValueChange={(v) => onChange({ ...state, fixedValue: v })}
          options={fixedOptions}
          placeholder={`Choose ${label.toLowerCase()}...`}
        />
      )}
      {state.mode === "mapped" && (
        <>
          <p className="text-xs text-muted-foreground">
            Assign the &ldquo;{label}&rdquo; destination to a column in the next step.
          </p>
          {matchBy && <MatchByToggle value={matchBy.value} onChange={matchBy.onChange} />}
        </>
      )}
      {state.mode === "none" && <p className="text-xs text-muted-foreground">Left blank for every product.</p>}
    </div>
  );
}

export function ImportBatchDefaultsStep({
  columnDestinations,
  classification,
  onClassificationChange,
  companies,
  industries,
  error,
  onBack,
  onNext,
}: {
  columnDestinations: Record<number, ColumnDestination>;
  classification: ClassificationState;
  onClassificationChange: (next: ClassificationState) => void;
  companies: CompanyOption[];
  industries: IndustryOption[];
  error?: string;
  onBack: () => void;
  onNext: () => void;
}) {
  function isDestinationMapped(dest: ColumnDestination): boolean {
    return Object.values(columnDestinations).includes(dest);
  }

  // Mirrors buildMapping's requiredField/optionalField rules in
  // variable-import-wizard.tsx, so this hint never disagrees with the
  // actual validation that runs on "Next".
  function isFieldIncomplete(field: ClassificationFieldKey, required: boolean): boolean {
    const state = classification[field];
    if (state.mode === "none") return false;
    if (state.mode === "mapped") return !isDestinationMapped(field as ColumnDestination);
    return required && !state.fixedValue;
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
    <Card>
      <CardHeader>
        <CardTitle>Batch defaults</CardTitle>
        <CardDescription>
          For each field, either set one fixed value for every product in this upload, or map it to a spreadsheet
          column in the next step. Company is set automatically from the matched Category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ClassificationFieldControl
            label="Category"
            state={classification.category}
            onChange={(next) => setField("category", next)}
            allowNone={false}
            fixedOptions={categoryOptions}
            required
            incomplete={isFieldIncomplete("category", true)}
            matchBy={
              classification.category.mode === "mapped"
                ? {
                    value: classification.categoryMatchBy,
                    onChange: (v) => onClassificationChange({ ...classification, categoryMatchBy: v }),
                  }
                : undefined
            }
          />
          <ClassificationFieldControl
            label="Sub-Category"
            state={classification.subCategory}
            onChange={(next) => setField("subCategory", next)}
            allowNone
            fixedOptions={subCategoryOptions}
            required={false}
            incomplete={isFieldIncomplete("subCategory", false)}
            matchBy={
              classification.subCategory.mode === "mapped"
                ? {
                    value: classification.subCategoryMatchBy,
                    onChange: (v) => onClassificationChange({ ...classification, subCategoryMatchBy: v }),
                  }
                : undefined
            }
          />
          <ClassificationFieldControl
            label="Product Family"
            state={classification.productFamily}
            onChange={(next) => setField("productFamily", next)}
            allowNone={false}
            fixedOptions={productFamilyOptions}
            required
            incomplete={isFieldIncomplete("productFamily", true)}
          />
          <ClassificationFieldControl
            label="Industry"
            state={classification.industry}
            onChange={(next) => setField("industry", next)}
            allowNone
            fixedOptions={industryOptions}
            required={false}
            incomplete={isFieldIncomplete("industry", false)}
          />
          <ClassificationFieldControl
            label="Sub-Industry"
            state={classification.subIndustry}
            onChange={(next) => setField("subIndustry", next)}
            allowNone
            fixedOptions={subIndustryOptions}
            required={false}
            incomplete={isFieldIncomplete("subIndustry", false)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            Next: Map columns
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
