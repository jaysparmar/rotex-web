import type { DownloadImportGrid } from "@/lib/download-grid";
import type { DownloadCategoryMatchBy } from "@/lib/download-import";
import type { ProductAttributeKey } from "@/lib/product-constants";

export type DownloadCategoryOption = { id: string; name: string; importReference: string | null };

/** UI state for one detected "Downloads" sub-column, before it's turned into a DownloadCategoryMapping. */
export type CategoryColumnState = {
  sheetColumn: number;
  headerText: string;
  matchBy: DownloadCategoryMatchBy;
  mode: "existing" | "create";
  categoryId: string | null;
};

export type AttributeColumnState = Partial<Record<ProductAttributeKey, number>>;

export type LocateState = {
  modelNumberColumn: number | null;
  attributeColumns: AttributeColumnState;
  bannerRow: number;
};

export type WizardGrid = DownloadImportGrid;

export function computeDefaultCategoryColumns(
  columns: number[],
  names: string[],
  categories: DownloadCategoryOption[]
): CategoryColumnState[] {
  return columns.map((col, i) => {
    const headerText = names[i];
    const needle = headerText.trim().toLowerCase();
    const match = categories.find((c) => c.name.toLowerCase() === needle);
    return {
      sheetColumn: col,
      headerText,
      matchBy: "name",
      mode: match ? "existing" : "create",
      categoryId: match?.id ?? null,
    };
  });
}
