import { PRODUCT_ATTRIBUTES } from "@/lib/product-constants";
import type { ColumnDestination } from "@/lib/variable-product-import";

export type CompanyOption = {
  id: string;
  name: string;
  categories: {
    id: string;
    name: string;
    importReference: string | null;
    subCategories: { id: string; name: string; importReference: string | null }[];
  }[];
};

export type IndustryOption = { id: string; name: string; importReference: string | null };
export type SubIndustryOption = { id: string; name: string; importReference: string | null };

/** UI state for one distinct industry reference token found in the mapped column. */
export type IndustryReferenceRowState = {
  reference: string;
  mode: "existing" | "create";
  industryId: string | null;
  name: string;
};

/** Same as above for sub-industries — "create" additionally needs a parent industry. */
export type SubIndustryReferenceRowState = {
  reference: string;
  mode: "existing" | "create";
  subIndustryId: string | null;
  name: string;
  parentIndustryReference: string;
};

export type ClassificationFieldState = { mode: "fixed" | "mapped" | "none"; fixedValue: string | null };

export type MatchBy = "name" | "importReference";

export type ClassificationState = {
  category: ClassificationFieldState;
  subCategory: ClassificationFieldState;
  productFamily: ClassificationFieldState;
  categoryMatchBy: MatchBy;
  subCategoryMatchBy: MatchBy;
};

export type ClassificationFieldKey = Exclude<keyof ClassificationState, "categoryMatchBy" | "subCategoryMatchBy">;

export const CLASSIFICATION_DESTINATIONS: { value: ColumnDestination; label: string; field: ClassificationFieldKey }[] = [
  { value: "category", label: "Category", field: "category" },
  { value: "subCategory", label: "Sub-Category", field: "subCategory" },
  { value: "productFamily", label: "Product Family", field: "productFamily" },
];

export const BASE_DESTINATIONS: { value: ColumnDestination; label: string }[] = [
  { value: "ignore", label: "— Ignore —" },
  { value: "modelNumber", label: "Model Number" },
  { value: "name", label: "Product Name" },
  { value: "image", label: "Product Image" },
  { value: "certificates", label: "Certificates" },
  { value: "features", label: "Features" },
  { value: "description", label: "Description" },
  { value: "industry", label: "Industry (comma-separated references)" },
  { value: "subIndustry", label: "Sub-Industry (comma-separated references)" },
  ...PRODUCT_ATTRIBUTES.map((a) => ({ value: a.key as ColumnDestination, label: a.label })),
];

const ALL_DESTINATION_LABELS = new Map<ColumnDestination, string>([
  ...BASE_DESTINATIONS.map((d) => [d.value, d.label] as const),
  ...CLASSIFICATION_DESTINATIONS.map((d) => [d.value, d.label] as const),
]);

/** Human-readable label for a mapped column destination (e.g. for cross-step "already mapped to X" hints). */
export function destinationLabel(dest: ColumnDestination): string {
  return ALL_DESTINATION_LABELS.get(dest) ?? dest;
}
