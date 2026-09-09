"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";
import { PRODUCT_FAMILIES } from "@/lib/product-constants";
import {
  type ColumnDestination,
  type ImportGrid,
  type VariableImportMapping,
  type VariableImportSummary,
} from "@/lib/variable-product-import";
import { resolveDownloadColumns, type CategoryColumnState, type DownloadCategoryOption, type DownloadImportGrid } from "@/lib/download-grid";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { ImportUploadStep } from "./import-upload-step";
import { ImportBatchDefaultsStep } from "./import-batch-defaults-step";
import { ImportColumnMappingStep } from "./import-column-mapping-step";
import { ImportDownloadsStep } from "./import-downloads-step";
import { ImportSpecificationsStep } from "./import-specifications-step";
import { ImportPreviewStep } from "./import-preview-step";
import type { ClassificationState, CompanyOption, IndustryOption } from "./types";

type Step = "upload" | "defaults" | "columns" | "downloads" | "specifications" | "preview";

const STEPS: StepperStep[] = [
  { id: "upload", label: "Upload" },
  { id: "defaults", label: "Batch Defaults" },
  { id: "columns", label: "Map Columns" },
  { id: "downloads", label: "Map Downloads" },
  { id: "specifications", label: "Specifications" },
  { id: "preview", label: "Preview & Import" },
];
type CommitResult = {
  createdProductCount: number;
  createdVariantCount: number;
  updatedVariantCount: number;
  createdAttributeValueCount: number;
  createdCategoryCount?: number;
  updatedTargetCount?: number;
  addedEntryCount?: number;
};
type PreviewSummary = VariableImportSummary & {
  downloads: { rowsWithLinks: number; totalLinks: number } | null;
};

type FieldOutcome<T> = { ok: true; config: T } | { ok: false; error: string };

async function postImport<T>(
  path: "preview" | "commit",
  grid: ImportGrid,
  richGrid: DownloadImportGrid | null,
  mapping: VariableImportMapping
): Promise<T> {
  const res = await adminFetch(`/api/admin/products/import/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grid, richGrid, mapping }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? `Failed to ${path} import`);
  return json.data as T;
}

function buildMapping(
  headerRow: number,
  columnDestinations: Record<number, ColumnDestination>,
  specificationColumns: number[],
  classification: ClassificationState,
  companies: CompanyOption[],
  richGrid: DownloadImportGrid | null,
  downloadsBannerRow: number,
  categoryColumns: CategoryColumnState[]
): { mapping: VariableImportMapping } | { error: string; step: "defaults" | "columns" | "downloads" } {
  function findColumn(dest: ColumnDestination): number | undefined {
    for (const [col, d] of Object.entries(columnDestinations)) {
      if (d === dest) return Number(col);
    }
    return undefined;
  }

  function requiredField(
    field: "category" | "productFamily",
    label: string
  ): FieldOutcome<{ mode: "fixed"; value: string } | { mode: "mapped"; column: number }> {
    const c = classification[field];
    if (c.mode === "fixed") {
      if (!c.fixedValue) return { ok: false, error: `Choose a fixed value for ${label}, or map it to a column.` };
      return { ok: true, config: { mode: "fixed", value: c.fixedValue } };
    }
    const col = findColumn(field);
    if (col == null) return { ok: false, error: `Assign the "${label}" destination to a column in the mapping table.` };
    return { ok: true, config: { mode: "mapped", column: col } };
  }

  function optionalField(
    field: "subCategory" | "industry" | "subIndustry",
    label: string
  ): FieldOutcome<{ mode: "none" } | { mode: "fixed"; value: string | null } | { mode: "mapped"; column: number }> {
    const c = classification[field];
    if (c.mode === "none") return { ok: true, config: { mode: "none" } };
    if (c.mode === "fixed") return { ok: true, config: { mode: "fixed", value: c.fixedValue } };
    const col = findColumn(field);
    if (col == null) return { ok: false, error: `Assign the "${label}" destination to a column, or set it to None.` };
    return { ok: true, config: { mode: "mapped", column: col } };
  }

  const modelNumberCol = findColumn("modelNumber");
  if (modelNumberCol == null) return { error: "Map exactly one column to Model Number.", step: "columns" };

  const category = requiredField("category", "Category");
  if (!category.ok) return { error: category.error, step: "defaults" };
  const productFamily = requiredField("productFamily", "Product Family");
  if (!productFamily.ok) return { error: productFamily.error, step: "defaults" };
  const subCategory = optionalField("subCategory", "Sub-Category");
  if (!subCategory.ok) return { error: subCategory.error, step: "defaults" };
  const industry = optionalField("industry", "Industry");
  if (!industry.ok) return { error: industry.error, step: "defaults" };
  const subIndustry = optionalField("subIndustry", "Sub-Industry");
  if (!subIndustry.ok) return { error: subIndustry.error, step: "defaults" };

  if (category.config.mode === "fixed" && subCategory.config.mode === "fixed" && subCategory.config.value) {
    const categoryId = category.config.value;
    const subCategoryId = subCategory.config.value;
    const owningCategory = companies.flatMap((c) => c.categories).find((cat) => cat.id === categoryId);
    const belongs = owningCategory?.subCategories.some((s) => s.id === subCategoryId) ?? false;
    if (!belongs) {
      return { error: "The selected Sub-Category does not belong to the selected Category.", step: "defaults" };
    }
  }

  let downloads: VariableImportMapping["downloads"];
  if (downloadsBannerRow > 0) {
    if (!richGrid) return { error: "Upload the sheet again before mapping downloads.", step: "downloads" };
    const resolved = resolveDownloadColumns(richGrid, downloadsBannerRow);
    if (!resolved.ok) return { error: resolved.error, step: "downloads" };
    if (categoryColumns.length !== resolved.result.columns.length) {
      return { error: "Re-open the Map Downloads step to finish mapping categories.", step: "downloads" };
    }
    for (const c of categoryColumns) {
      if (c.mode === "existing" && !c.categoryId) {
        return { error: `Choose a category for "${c.headerText}", or switch it to create new.`, step: "downloads" };
      }
    }
    downloads = {
      bannerRow: downloadsBannerRow,
      categories: categoryColumns.map((c) => ({
        sheetColumn: c.sheetColumn,
        headerText: c.headerText,
        matchBy: c.matchBy,
        target:
          c.mode === "existing"
            ? { kind: "existing" as const, categoryId: c.categoryId! }
            : { kind: "create" as const, importReference: c.matchBy === "importReference" ? c.headerText : undefined },
      })),
    };
  }

  return {
    mapping: {
      headerRow,
      columnDestinations,
      specificationColumns,
      classification: {
        category: category.config,
        subCategory: subCategory.config,
        productFamily: productFamily.config,
        industry: industry.config,
        subIndustry: subIndustry.config,
      },
      categoryMatchBy: classification.categoryMatchBy,
      subCategoryMatchBy: classification.subCategoryMatchBy,
      downloads,
    },
  };
}

export function VariableImportWizard({
  companies,
  industries,
  downloadCategories,
}: {
  companies: CompanyOption[];
  industries: IndustryOption[];
  downloadCategories: DownloadCategoryOption[];
}) {
  const [step, setStep] = useState<Step>("upload");
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [richGrid, setRichGrid] = useState<DownloadImportGrid | null>(null);
  const [headerRow, setHeaderRow] = useState(1);
  const [columnDestinations, setColumnDestinations] = useState<Record<number, ColumnDestination>>({});
  const [specificationColumns, setSpecificationColumns] = useState<number[]>([]);
  const [downloadsBannerRow, setDownloadsBannerRow] = useState(0);
  const [categoryColumns, setCategoryColumns] = useState<CategoryColumnState[]>([]);
  const [classification, setClassification] = useState<ClassificationState>({
    category: { mode: "fixed", fixedValue: null },
    subCategory: { mode: "none", fixedValue: null },
    productFamily: { mode: "fixed", fixedValue: PRODUCT_FAMILIES[0] },
    industry: { mode: "none", fixedValue: null },
    subIndustry: { mode: "none", fixedValue: null },
    categoryMatchBy: "name",
    subCategoryMatchBy: "name",
  });
  const [mappingError, setMappingError] = useState<string>();
  const [summary, setSummary] = useState<PreviewSummary | null>(null);
  const [committedResult, setCommittedResult] = useState<CommitResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);

  function handleParsed(newGrid: string[][], newRichGrid: DownloadImportGrid) {
    setGrid(newGrid);
    setRichGrid(newRichGrid);
    setHeaderRow(1);
    setColumnDestinations({});
    setSpecificationColumns([]);
    setDownloadsBannerRow(0);
    setCategoryColumns([]);
  }

  async function handleRunPreview() {
    const result = buildMapping(
      headerRow,
      columnDestinations,
      specificationColumns,
      classification,
      companies,
      richGrid,
      downloadsBannerRow,
      categoryColumns
    );
    if ("error" in result) {
      setMappingError(result.error);
      setStep(result.step);
      return;
    }
    setMappingError(undefined);
    setStep("preview");
    setPreviewing(true);
    setSummary(null);
    setCommittedResult(null);
    try {
      const preview = await postImport<PreviewSummary>("preview", grid ?? [], richGrid, result.mapping);
      setSummary(preview);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to analyze the spreadsheet");
      setStep("columns");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleCommit() {
    const result = buildMapping(
      headerRow,
      columnDestinations,
      specificationColumns,
      classification,
      companies,
      richGrid,
      downloadsBannerRow,
      categoryColumns
    );
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setCommitting(true);
    try {
      const outcome = await postImport<PreviewSummary & CommitResult>("commit", grid ?? [], richGrid, result.mapping);
      setSummary(outcome);
      setCommittedResult(outcome);
      toast.success("Import complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Stepper
        steps={STEPS}
        currentId={step}
        onStepClick={(id) => {
          const targetIndex = STEPS.findIndex((s) => s.id === id);
          const currentIndex = STEPS.findIndex((s) => s.id === step);
          if (targetIndex < currentIndex) setStep(id as Step);
        }}
      />

      {step === "upload" && (
        <ImportUploadStep
          grid={grid}
          headerRow={headerRow}
          onParsed={handleParsed}
          onHeaderRowChange={setHeaderRow}
          onNext={() => setStep("defaults")}
        />
      )}

      {step === "defaults" && grid && (
        <ImportBatchDefaultsStep
          columnDestinations={columnDestinations}
          classification={classification}
          onClassificationChange={setClassification}
          companies={companies}
          industries={industries}
          error={mappingError}
          onBack={() => setStep("upload")}
          onNext={() => setStep("columns")}
        />
      )}

      {step === "columns" && grid && (
        <ImportColumnMappingStep
          grid={grid}
          headerRow={headerRow}
          columnDestinations={columnDestinations}
          onColumnDestinationsChange={setColumnDestinations}
          classification={classification}
          error={mappingError}
          onBack={() => setStep("defaults")}
          onNext={() => setStep("downloads")}
        />
      )}

      {step === "downloads" && richGrid && (
        <ImportDownloadsStep
          richGrid={richGrid}
          categories={downloadCategories}
          bannerRow={downloadsBannerRow}
          onBannerRowChange={setDownloadsBannerRow}
          categoryColumns={categoryColumns}
          onCategoryColumnsChange={setCategoryColumns}
          error={mappingError}
          onBack={() => setStep("columns")}
          onNext={() => setStep("specifications")}
        />
      )}

      {step === "specifications" && grid && (
        <ImportSpecificationsStep
          grid={grid}
          headerRow={headerRow}
          columnDestinations={columnDestinations}
          specificationColumns={specificationColumns}
          onChange={setSpecificationColumns}
          onBack={() => setStep("downloads")}
          onNext={handleRunPreview}
        />
      )}

      {step === "preview" && (
        <ImportPreviewStep
          summary={summary}
          loading={previewing}
          committing={committing}
          committedResult={committedResult}
          onBack={() => setStep("specifications")}
          onRefreshPreview={handleRunPreview}
          onCommit={handleCommit}
        />
      )}
    </div>
  );
}
