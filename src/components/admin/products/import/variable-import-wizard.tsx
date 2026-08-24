"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PRODUCT_FAMILIES } from "@/lib/product-constants";
import type { ColumnDestination, ImportGrid, VariableImportMapping, VariableImportSummary } from "@/lib/variable-product-import";
import { ImportUploadStep } from "./import-upload-step";
import { ImportMappingStep } from "./import-mapping-step";
import { ImportSpecificationsStep } from "./import-specifications-step";
import { ImportPreviewStep } from "./import-preview-step";
import type { ClassificationState, CompanyOption, IndustryOption, SheetData } from "./types";

type Step = "upload" | "mapping" | "specifications" | "preview";
type CommitResult = {
  createdProductCount: number;
  createdVariantCount: number;
  updatedVariantCount: number;
  createdAttributeValueCount: number;
};

type FieldOutcome<T> = { ok: true; config: T } | { ok: false; error: string };

async function postImport<T>(path: "preview" | "commit", grid: ImportGrid, mapping: VariableImportMapping): Promise<T> {
  const res = await fetch(`/api/admin/products/import/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grid, mapping }),
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
  companies: CompanyOption[]
): { mapping: VariableImportMapping } | { error: string } {
  function findColumn(dest: ColumnDestination): number | undefined {
    for (const [col, d] of Object.entries(columnDestinations)) {
      if (d === dest) return Number(col);
    }
    return undefined;
  }

  function requiredField(
    field: "company" | "category" | "productFamily",
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
  if (modelNumberCol == null) return { error: "Map exactly one column to Model Number." };

  const company = requiredField("company", "Company");
  if (!company.ok) return { error: company.error };
  const category = requiredField("category", "Category");
  if (!category.ok) return { error: category.error };
  const productFamily = requiredField("productFamily", "Product Family");
  if (!productFamily.ok) return { error: productFamily.error };
  const subCategory = optionalField("subCategory", "Sub-Category");
  if (!subCategory.ok) return { error: subCategory.error };
  const industry = optionalField("industry", "Industry");
  if (!industry.ok) return { error: industry.error };
  const subIndustry = optionalField("subIndustry", "Sub-Industry");
  if (!subIndustry.ok) return { error: subIndustry.error };

  if (category.config.mode === "fixed" && subCategory.config.mode === "fixed" && subCategory.config.value) {
    const categoryId = category.config.value;
    const subCategoryId = subCategory.config.value;
    const owningCategory = companies.flatMap((c) => c.categories).find((cat) => cat.id === categoryId);
    const belongs = owningCategory?.subCategories.some((s) => s.id === subCategoryId) ?? false;
    if (!belongs) {
      return { error: "The selected Sub-Category does not belong to the selected Category." };
    }
  }

  return {
    mapping: {
      headerRow,
      columnDestinations,
      specificationColumns,
      classification: {
        company: company.config,
        category: category.config,
        subCategory: subCategory.config,
        productFamily: productFamily.config,
        industry: industry.config,
        subIndustry: subIndustry.config,
      },
      categoryMatchBy: classification.categoryMatchBy,
      subCategoryMatchBy: classification.subCategoryMatchBy,
    },
  };
}

export function VariableImportWizard({
  companies,
  industries,
}: {
  companies: CompanyOption[];
  industries: IndustryOption[];
}) {
  const [step, setStep] = useState<Step>("upload");
  const [sheets, setSheets] = useState<SheetData[] | null>(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [headerRow, setHeaderRow] = useState(1);
  const [columnDestinations, setColumnDestinations] = useState<Record<number, ColumnDestination>>({});
  const [specificationColumns, setSpecificationColumns] = useState<number[]>([]);
  const [classification, setClassification] = useState<ClassificationState>({
    company: { mode: "fixed", fixedValue: companies[0]?.id ?? null },
    category: { mode: "fixed", fixedValue: null },
    subCategory: { mode: "none", fixedValue: null },
    productFamily: { mode: "fixed", fixedValue: PRODUCT_FAMILIES[0] },
    industry: { mode: "none", fixedValue: null },
    subIndustry: { mode: "none", fixedValue: null },
    categoryMatchBy: "name",
    subCategoryMatchBy: "name",
  });
  const [mappingError, setMappingError] = useState<string>();
  const [summary, setSummary] = useState<VariableImportSummary | null>(null);
  const [committedResult, setCommittedResult] = useState<CommitResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);

  const grid = sheets?.[selectedSheetIndex]?.grid ?? [];

  function handleParsed(newSheets: SheetData[]) {
    setSheets(newSheets);
    setSelectedSheetIndex(0);
    setHeaderRow(1);
    setColumnDestinations({});
    setSpecificationColumns([]);
  }

  async function handleRunPreview() {
    const result = buildMapping(headerRow, columnDestinations, specificationColumns, classification, companies);
    if ("error" in result) {
      setMappingError(result.error);
      setStep("mapping");
      return;
    }
    setMappingError(undefined);
    setStep("preview");
    setPreviewing(true);
    setSummary(null);
    setCommittedResult(null);
    try {
      const preview = await postImport<VariableImportSummary>("preview", grid, result.mapping);
      setSummary(preview);
    } catch {
      toast.error("Failed to analyze the spreadsheet");
      setStep("mapping");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleCommit() {
    const result = buildMapping(headerRow, columnDestinations, specificationColumns, classification, companies);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setCommitting(true);
    try {
      const outcome = await postImport<VariableImportSummary & CommitResult>("commit", grid, result.mapping);
      setSummary(outcome);
      setCommittedResult(outcome);
      toast.success("Import complete");
    } catch {
      toast.error("Import failed");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {step === "upload" && (
        <ImportUploadStep
          sheets={sheets}
          selectedSheetIndex={selectedSheetIndex}
          headerRow={headerRow}
          onParsed={handleParsed}
          onSelectSheet={(i) => {
            setSelectedSheetIndex(i);
            setColumnDestinations({});
            setSpecificationColumns([]);
          }}
          onHeaderRowChange={setHeaderRow}
          onNext={() => setStep("mapping")}
        />
      )}

      {step === "mapping" && sheets && (
        <ImportMappingStep
          grid={grid}
          headerRow={headerRow}
          columnDestinations={columnDestinations}
          onColumnDestinationsChange={setColumnDestinations}
          classification={classification}
          onClassificationChange={setClassification}
          companies={companies}
          industries={industries}
          error={mappingError}
          onBack={() => setStep("upload")}
          onNext={() => setStep("specifications")}
        />
      )}

      {step === "specifications" && sheets && (
        <ImportSpecificationsStep
          grid={grid}
          headerRow={headerRow}
          specificationColumns={specificationColumns}
          onChange={setSpecificationColumns}
          onBack={() => setStep("mapping")}
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
