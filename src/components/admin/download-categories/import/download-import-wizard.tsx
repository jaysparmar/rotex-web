"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";
import { resolveDownloadColumns } from "@/lib/download-grid";
import type { DownloadImportMapping, DownloadImportSummary } from "@/lib/download-import";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { DownloadImportUploadStep } from "./download-import-upload-step";
import { DownloadImportLocateStep } from "./download-import-locate-step";
import { DownloadImportCategoriesStep } from "./download-import-categories-step";
import { DownloadImportPreviewStep } from "./download-import-preview-step";
import { computeDefaultCategoryColumns, type CategoryColumnState, type DownloadCategoryOption, type LocateState, type WizardGrid } from "./types";

type Step = "upload" | "locate" | "categories" | "preview";

const STEPS: StepperStep[] = [
  { id: "upload", label: "Upload" },
  { id: "locate", label: "Locate Downloads" },
  { id: "categories", label: "Map Categories" },
  { id: "preview", label: "Preview & Import" },
];

type CommitResult = { createdCategoryCount: number; updatedTargetCount: number; addedEntryCount: number };

async function postImport<T>(path: "preview" | "commit", grid: WizardGrid, mapping: DownloadImportMapping): Promise<T> {
  const res = await adminFetch(`/api/admin/download-categories/import/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grid, mapping }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? `Failed to ${path} import`);
  return json.data as T;
}

function buildMapping(
  grid: WizardGrid,
  locate: LocateState,
  categoryColumns: CategoryColumnState[]
): { mapping: DownloadImportMapping } | { error: string; step: "locate" | "categories" } {
  if (locate.modelNumberColumn == null) {
    return { error: "Choose the Model Number column.", step: "locate" };
  }
  const resolved = resolveDownloadColumns(grid, locate.bannerRow);
  if (!resolved.ok) {
    return { error: resolved.error, step: "locate" };
  }
  for (const col of categoryColumns) {
    if (col.mode === "existing" && !col.categoryId) {
      return { error: `Choose a category for "${col.headerText}", or switch it to "Create new".`, step: "categories" };
    }
  }

  return {
    mapping: {
      modelNumberColumn: locate.modelNumberColumn,
      attributeColumns: locate.attributeColumns,
      bannerRow: locate.bannerRow,
      categories: categoryColumns.map((c) => ({
        sheetColumn: c.sheetColumn,
        headerText: c.headerText,
        matchBy: c.matchBy,
        target:
          c.mode === "existing"
            ? { kind: "existing", categoryId: c.categoryId! }
            : { kind: "create", importReference: c.matchBy === "importReference" ? c.headerText : undefined },
      })),
    },
  };
}

export function DownloadImportWizard({ categories }: { categories: DownloadCategoryOption[] }) {
  const [step, setStep] = useState<Step>("upload");
  const [grid, setGrid] = useState<WizardGrid | null>(null);
  const [locate, setLocate] = useState<LocateState>({ modelNumberColumn: null, attributeColumns: {}, bannerRow: 0 });
  const [categoryColumns, setCategoryColumns] = useState<CategoryColumnState[]>([]);
  const [mappingError, setMappingError] = useState<string>();
  const [summary, setSummary] = useState<DownloadImportSummary | null>(null);
  const [committedResult, setCommittedResult] = useState<CommitResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);

  function handleParsed(newGrid: WizardGrid) {
    setGrid(newGrid);
    setLocate({ modelNumberColumn: null, attributeColumns: {}, bannerRow: 0 });
    setCategoryColumns([]);
  }

  function handleLocateNext() {
    if (!grid) return;
    const resolved = resolveDownloadColumns(grid, locate.bannerRow);
    if (!resolved.ok) {
      setMappingError(resolved.error);
      return;
    }
    setMappingError(undefined);
    setCategoryColumns(computeDefaultCategoryColumns(resolved.result.columns, resolved.result.names, categories));
    setStep("categories");
  }

  async function handleRunPreview() {
    if (!grid) return;
    const result = buildMapping(grid, locate, categoryColumns);
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
      const preview = await postImport<DownloadImportSummary>("preview", grid, result.mapping);
      setSummary(preview);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to analyze the sheet");
      setStep("categories");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleCommit() {
    if (!grid) return;
    const result = buildMapping(grid, locate, categoryColumns);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setCommitting(true);
    try {
      const outcome = await postImport<DownloadImportSummary & CommitResult>("commit", grid, result.mapping);
      setSummary(outcome);
      setCommittedResult(outcome);
      toast.success("Import complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setCommitting(false);
    }
  }

  const resolvedColumns = grid && locate.bannerRow > 0 ? resolveDownloadColumns(grid, locate.bannerRow) : null;

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

      {step === "upload" && <DownloadImportUploadStep grid={grid} onParsed={handleParsed} onNext={() => setStep("locate")} />}

      {step === "locate" && grid && (
        <DownloadImportLocateStep
          grid={grid}
          state={locate}
          onChange={setLocate}
          onBack={() => setStep("upload")}
          onNext={handleLocateNext}
        />
      )}

      {step === "categories" && grid && resolvedColumns?.ok && (
        <DownloadImportCategoriesStep
          columns={resolvedColumns.result.columns}
          categories={categories}
          state={categoryColumns}
          onChange={setCategoryColumns}
          onBack={() => setStep("locate")}
          onNext={handleRunPreview}
        />
      )}

      {step === "preview" && (
        <DownloadImportPreviewStep
          summary={summary}
          loading={previewing}
          committing={committing}
          committedResult={committedResult}
          onBack={() => setStep("categories")}
          onRefreshPreview={handleRunPreview}
          onCommit={handleCommit}
        />
      )}

      {mappingError && step !== "locate" && step !== "categories" && (
        <p className="text-sm text-destructive">{mappingError}</p>
      )}
    </div>
  );
}
