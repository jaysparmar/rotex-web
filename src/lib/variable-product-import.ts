import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { excelColumnLabel } from "@/lib/excel-columns";
import { PRODUCT_ATTRIBUTES, PRODUCT_FAMILIES, type ProductAttributeKey } from "@/lib/product-constants";
import { cleanDownloadName, resolveDownloadColumns, type DownloadImportGrid } from "@/lib/download-grid";
import type { DownloadCategoryMapping } from "@/lib/download-import";
import type { ProductInput, VariantInput } from "@/app/admin/(dashboard)/products/actions";

const ATTRIBUTE_KEYS = PRODUCT_ATTRIBUTES.map((a) => a.key);

export type ImportGrid = string[][];

type ClassificationField = "category" | "subCategory" | "productFamily" | "industry" | "subIndustry";

export type ColumnDestination =
  | "ignore"
  | "modelNumber"
  | "name"
  | "image"
  | "certificates"
  | "features"
  | "description"
  | ClassificationField
  | ProductAttributeKey;

export type ClassificationFieldConfig = { mode: "fixed"; value: string | null } | { mode: "mapped"; column: number };
export type OptionalClassificationFieldConfig = ClassificationFieldConfig | { mode: "none" };
/** Industry/Sub-Industry cells hold a comma-separated list, so there's no single "fixed value" mode. */
export type MultiClassificationFieldConfig = { mode: "none" } | { mode: "mapped"; column: number };

export type IndustryReferenceTarget = { kind: "existing"; industryId: string } | { kind: "create"; name: string };
export type SubIndustryReferenceTarget =
  | { kind: "existing"; subIndustryId: string }
  | { kind: "create"; name: string; parentIndustryReference: string };

export type IndustryReferenceMapping = { reference: string; target: IndustryReferenceTarget };
export type SubIndustryReferenceMapping = { reference: string; target: SubIndustryReferenceTarget };

export type VariableImportMapping = {
  headerRow: number; // 1-indexed row number containing column labels
  columnDestinations: Record<number, ColumnDestination>; // 0-indexed column -> destination
  specificationColumns: number[]; // 0-indexed columns whose {header, cell} becomes a spec entry per variant
  classification: {
    category: ClassificationFieldConfig;
    subCategory: OptionalClassificationFieldConfig;
    productFamily: ClassificationFieldConfig;
    industry: MultiClassificationFieldConfig;
    subIndustry: MultiClassificationFieldConfig;
  };
  categoryMatchBy: "name" | "importReference";
  subCategoryMatchBy: "name" | "importReference";
  /** Every distinct industry/sub-industry reference token found in the mapped column(s), each
   * resolved (by the "Map Industries" wizard step) to either an existing record or a new one to
   * create. Absent/empty when no column is mapped to industry/sub-industry. */
  industryReferences?: IndustryReferenceMapping[];
  subIndustryReferences?: SubIndustryReferenceMapping[];
  downloads?: { bannerRow: number; categories: DownloadCategoryMapping[] };
};

export type VariableImportRowError = { rowNumber: number; modelNumber: string | null; reason: string };

export type VariableImportDuplicateDetail = {
  rowNumber: number;
  modelNumber: string;
  variantLabel: string;
  reason: string;
};

export type VariableImportSummary = {
  totalDataRows: number;
  groupCount: number;
  productsToCreate: number;
  productsReused: number;
  variantsToCreate: number;
  variantsToUpdate: number;
  newAttributeValues: { attribute: string; value: string }[];
  newIndustries: { reference: string; name: string }[];
  newSubIndustries: { reference: string; name: string; parentIndustryReference: string }[];
  errors: VariableImportRowError[];
  duplicates: VariableImportDuplicateDetail[];
};

type StagedProduct = ProductInput & { modelNumber: string };

/**
 * A variant's data before industry/sub-industry references are fully resolved to real ids —
 * `industryIds`/`subIndustryIds` are already-resolved (matched an existing record), while
 * `pendingIndustryReferences`/`pendingSubIndustryReferences` are "create new" tokens that only
 * become real ids once `applyVariableProductImportPlan` creates those records. `downloads` is
 * deliberately omitted: new variants always get `[]`, and existing ones must never have this
 * field touched by this importer (see the update loop below).
 */
type StagedVariantData = Omit<VariantInput, "downloads" | "industryIds" | "subIndustryIds"> & {
  industryIds: string[];
  pendingIndustryReferences: string[];
  subIndustryIds: string[];
  pendingSubIndustryReferences: string[];
};

type StagedVariantUpdate = { variantId: string; data: StagedVariantData };

export type VariableImportPlan = {
  summary: VariableImportSummary;
  newProducts: StagedProduct[];
  variantsToCreate: Map<string, StagedVariantData[]>;
  variantsToUpdate: StagedVariantUpdate[];
  existingProductIdByModelNumber: Map<string, string>;
  newAttributeValueRows: { attribute: string; value: string; order: number }[];
  industryReferences: IndustryReferenceMapping[];
  subIndustryReferences: SubIndustryReferenceMapping[];
};

function emptyPlan(reason: string): VariableImportPlan {
  return {
    summary: {
      totalDataRows: 0,
      groupCount: 0,
      productsToCreate: 0,
      productsReused: 0,
      variantsToCreate: 0,
      variantsToUpdate: 0,
      newAttributeValues: [],
      newIndustries: [],
      newSubIndustries: [],
      errors: [{ rowNumber: 0, modelNumber: null, reason }],
      duplicates: [],
    },
    newProducts: [],
    variantsToCreate: new Map(),
    variantsToUpdate: [],
    existingProductIdByModelNumber: new Map(),
    newAttributeValueRows: [],
    industryReferences: [],
    subIndustryReferences: [],
  };
}

function variantLabel(v: {
  size: string | null;
  variantType: string | null;
  orifice: string | null;
  minOperatingTemp: string | null;
  maxOperatingTemp: string | null;
  flowFactor: string | null;
}) {
  return [v.size, v.variantType, v.orifice, v.minOperatingTemp, v.maxOperatingTemp, v.flowFactor]
    .filter(Boolean)
    .join(" / ");
}

function findSingleColumn(mapping: VariableImportMapping, dest: ColumnDestination): number | undefined {
  for (const [col, d] of Object.entries(mapping.columnDestinations)) {
    if (d === dest) return Number(col);
  }
  return undefined;
}

/**
 * The Model Number and variant-attribute columns are already chosen in the "Map Columns" step —
 * reuse them for target-resolution when attaching downloads, instead of asking the user to pick
 * them again.
 */
export function deriveDownloadTargetColumns(
  mapping: VariableImportMapping
): { modelNumberColumn: number; attributeColumns: Partial<Record<ProductAttributeKey, number>> } | null {
  const modelNumberColumn = findSingleColumn(mapping, "modelNumber");
  if (modelNumberColumn == null) return null;
  const attributeColumns: Partial<Record<ProductAttributeKey, number>> = {};
  for (const key of ATTRIBUTE_KEYS) {
    const col = findSingleColumn(mapping, key);
    if (col != null) attributeColumns[key] = col;
  }
  return { modelNumberColumn, attributeColumns };
}

/**
 * A lightweight, DB-free count of the links sitting in the mapped Downloads columns, for the
 * preview screen. It intentionally does not resolve real product/variant targets — rows for
 * brand-new products can't be resolved until those rows are created by this same import, so full
 * resolution happens once, at commit time, via `analyzeDownloadImport`.
 */
export function estimatePendingDownloadLinks(
  richGrid: DownloadImportGrid,
  downloads: { bannerRow: number; categories: DownloadCategoryMapping[] }
): { rowsWithLinks: number; totalLinks: number } {
  const resolved = resolveDownloadColumns(richGrid, downloads.bannerRow);
  if (!resolved.ok) return { rowsWithLinks: 0, totalLinks: 0 };

  const dataRows = richGrid.slice(downloads.bannerRow + 1);
  let rowsWithLinks = 0;
  let totalLinks = 0;
  for (const row of dataRows) {
    let rowHasLink = false;
    for (const col of resolved.result.columns) {
      const cell = row[col];
      if (!cell) continue;
      for (const link of cell.links) {
        const title = cleanDownloadName(link.text);
        const url = link.href.trim();
        if (title && url) {
          totalLinks++;
          rowHasLink = true;
        }
      }
    }
    if (rowHasLink) rowsWithLinks++;
  }
  return { rowsWithLinks, totalLinks };
}

/** Splits an Industry/Sub-Industry cell's comma-separated reference codes into clean tokens. */
export function splitReferences(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

type TokenResolution = { kind: "id"; id: string } | { kind: "pending"; reference: string } | { kind: "unresolved" };

function resolveIndustryToken(
  token: string,
  existingByReference: Map<string, string>,
  configured: IndustryReferenceMapping[]
): TokenResolution {
  const key = token.toLowerCase();
  const existingId = existingByReference.get(key);
  if (existingId) return { kind: "id", id: existingId };
  const entry = configured.find((r) => r.reference.toLowerCase() === key);
  if (!entry) return { kind: "unresolved" };
  return entry.target.kind === "existing" ? { kind: "id", id: entry.target.industryId } : { kind: "pending", reference: entry.reference };
}

function resolveSubIndustryToken(
  token: string,
  existingByReference: Map<string, string>,
  configured: SubIndustryReferenceMapping[]
): TokenResolution {
  const key = token.toLowerCase();
  const existingId = existingByReference.get(key);
  if (existingId) return { kind: "id", id: existingId };
  const entry = configured.find((r) => r.reference.toLowerCase() === key);
  if (!entry) return { kind: "unresolved" };
  return entry.target.kind === "existing"
    ? { kind: "id", id: entry.target.subIndustryId }
    : { kind: "pending", reference: entry.reference };
}

function variantKey(v: {
  size: string | null;
  variantType: string | null;
  orifice: string | null;
  minOperatingTemp: string | null;
  maxOperatingTemp: string | null;
  flowFactor: string | null;
}) {
  return [v.size, v.variantType, v.orifice, v.minOperatingTemp, v.maxOperatingTemp, v.flowFactor]
    .map((x) => x ?? "")
    .join("");
}

type Resolved = { ok: true; id: string | null } | { ok: false; reason: string };

function resolveClassificationValue(
  fieldLabel: string,
  config: OptionalClassificationFieldConfig,
  firstRow: string[],
  lookup: Map<string, string>,
  required: boolean
): Resolved {
  if (config.mode === "none") return { ok: true, id: null };
  if (config.mode === "fixed") {
    if (!config.value) return required ? { ok: false, reason: `${fieldLabel} is not set` } : { ok: true, id: null };
    return { ok: true, id: config.value };
  }
  const raw = (firstRow[config.column] ?? "").trim();
  if (!raw) return required ? { ok: false, reason: `Missing ${fieldLabel}` } : { ok: true, id: null };
  const match = lookup.get(raw.toLowerCase());
  if (!match) return { ok: false, reason: `${fieldLabel} "${raw}" not found` };
  return { ok: true, id: match };
}

function resolveProductFamily(config: ClassificationFieldConfig, firstRow: string[]): Resolved {
  if (config.mode === "fixed") {
    if (!config.value) return { ok: false, reason: "Product Family is not set" };
    return { ok: true, id: config.value };
  }
  const raw = (firstRow[config.column] ?? "").trim();
  if (!raw) return { ok: false, reason: "Missing Product Family" };
  const match = PRODUCT_FAMILIES.find((f) => f.toLowerCase() === raw.toLowerCase());
  if (!match) return { ok: false, reason: `Product Family "${raw}" not recognized` };
  return { ok: true, id: match };
}

export async function analyzeVariableProductImport(
  grid: ImportGrid,
  mapping: VariableImportMapping
): Promise<VariableImportPlan> {
  const modelNumberCol = findSingleColumn(mapping, "modelNumber");
  if (modelNumberCol == null) return emptyPlan("No column is mapped to Model Number.");

  const headerValues = grid[mapping.headerRow - 1] ?? [];
  const columnLabel = (col: number) => (headerValues[col] ?? "").trim() || excelColumnLabel(col);

  const nameCol = findSingleColumn(mapping, "name");
  const imageCol = findSingleColumn(mapping, "image");
  const certificatesCol = findSingleColumn(mapping, "certificates");
  const featuresCol = findSingleColumn(mapping, "features");
  const descriptionCol = findSingleColumn(mapping, "description");
  const specCols = mapping.specificationColumns;
  const attributeCols: Partial<Record<ProductAttributeKey, number>> = {};
  for (const key of ATTRIBUTE_KEYS) {
    const col = findSingleColumn(mapping, key);
    if (col != null) attributeCols[key] = col;
  }
  const industryCol = mapping.classification.industry.mode === "mapped" ? mapping.classification.industry.column : null;
  const subIndustryCol =
    mapping.classification.subIndustry.mode === "mapped" ? mapping.classification.subIndustry.column : null;
  const industryReferences = mapping.industryReferences ?? [];
  const subIndustryReferences = mapping.subIndustryReferences ?? [];

  const dataRows = grid
    .slice(mapping.headerRow)
    .map((cells, i) => ({ rowNumber: mapping.headerRow + 1 + i, cells }));

  const errors: VariableImportRowError[] = [];
  const groups = new Map<string, { rowNumber: number; cells: string[] }[]>();
  for (const row of dataRows) {
    if (row.cells.every((c) => !c || !c.trim())) continue;
    const modelNumber = (row.cells[modelNumberCol] ?? "").trim();
    if (!modelNumber) {
      errors.push({ rowNumber: row.rowNumber, modelNumber: null, reason: "Missing Model Number" });
      continue;
    }
    if (!groups.has(modelNumber)) groups.set(modelNumber, []);
    groups.get(modelNumber)!.push(row);
  }

  // Classification lookups (case-insensitive name matching, scoped to already-resolved parents).
  // Category is looked up across all companies at once (the company is derived from whichever
  // category matches), so a name/reference that matches more than one company's category is
  // excluded from the lookup entirely rather than silently picking one.
  const companies = await prisma.company.findMany({ include: { categories: { include: { subCategories: true } } } });

  function addUnique(map: Map<string, string>, seen: Set<string>, key: string, id: string) {
    if (seen.has(key)) {
      map.delete(key);
      return;
    }
    seen.add(key);
    map.set(key, id);
  }

  const categoryByName = new Map<string, string>();
  const categoryByImportReference = new Map<string, string>();
  const seenCategoryNames = new Set<string>();
  const seenCategoryImportReferences = new Set<string>();
  const categoryCompanyId = new Map<string, string>();
  const categoryNameById = new Map<string, string>();
  const subCategoriesByCategory = new Map<string, Map<string, string>>();
  const subCategoriesByCategoryByImportReference = new Map<string, Map<string, string>>();
  const subCategoryNameById = new Map<string, string>();
  const subCategoryParentCategoryId = new Map<string, string>();
  for (const c of companies) {
    for (const cat of c.categories) {
      categoryCompanyId.set(cat.id, c.id);
      categoryNameById.set(cat.id, cat.name);
      addUnique(categoryByName, seenCategoryNames, cat.name.toLowerCase(), cat.id);
      if (cat.importReference && cat.importReference.trim()) {
        addUnique(categoryByImportReference, seenCategoryImportReferences, cat.importReference.trim().toLowerCase(), cat.id);
      }
      subCategoriesByCategory.set(cat.id, new Map(cat.subCategories.map((s) => [s.name.toLowerCase(), s.id])));
      subCategoriesByCategoryByImportReference.set(
        cat.id,
        new Map(
          cat.subCategories
            .filter((s) => s.importReference && s.importReference.trim())
            .map((s) => [s.importReference!.trim().toLowerCase(), s.id])
        )
      );
      for (const s of cat.subCategories) {
        subCategoryNameById.set(s.id, s.name);
        subCategoryParentCategoryId.set(s.id, cat.id);
      }
    }
  }

  const existingIndustries = await prisma.industry.findMany({ select: { id: true, importReference: true } });
  const industryIdByReference = new Map(
    existingIndustries
      .filter((i) => i.importReference?.trim())
      .map((i) => [i.importReference!.trim().toLowerCase(), i.id] as const)
  );
  const existingSubIndustries = await prisma.subIndustry.findMany({ select: { id: true, importReference: true } });
  const subIndustryIdByReference = new Map(
    existingSubIndustries
      .filter((s) => s.importReference?.trim())
      .map((s) => [s.importReference!.trim().toLowerCase(), s.id] as const)
  );

  // Attribute value lookups (case-sensitive exact match) + next `order` per key
  const attributeRows = await prisma.attributeValue.findMany({ select: { attribute: true, value: true, order: true } });
  const existingAttrValues = new Map<string, Set<string>>();
  const nextOrder = new Map<string, number>();
  for (const key of ATTRIBUTE_KEYS) {
    existingAttrValues.set(key, new Set());
    nextOrder.set(key, 0);
  }
  for (const row of attributeRows) {
    if (!existingAttrValues.has(row.attribute)) {
      existingAttrValues.set(row.attribute, new Set());
      nextOrder.set(row.attribute, 0);
    }
    existingAttrValues.get(row.attribute)!.add(row.value);
    nextOrder.set(row.attribute, Math.max(nextOrder.get(row.attribute)!, row.order + 1));
  }

  // Existing products/variants for the Model Numbers present in this sheet
  const existingProducts = await prisma.product.findMany({
    where: { modelNumber: { in: [...groups.keys()] } },
    select: { id: true, modelNumber: true },
  });
  const existingProductIdByModelNumber = new Map(existingProducts.map((p) => [p.modelNumber, p.id] as const));
  const existingProductIds = existingProducts.map((p) => p.id);
  const existingVariantRows = existingProductIds.length
    ? await prisma.productVariant.findMany({
        where: { productId: { in: existingProductIds } },
        select: {
          id: true,
          productId: true,
          size: true,
          variantType: true,
          orifice: true,
          minOperatingTemp: true,
          maxOperatingTemp: true,
          flowFactor: true,
        },
      })
    : [];
  const existingVariantIdsByProduct = new Map<string, Map<string, string>>();
  for (const v of existingVariantRows) {
    if (!existingVariantIdsByProduct.has(v.productId)) existingVariantIdsByProduct.set(v.productId, new Map());
    existingVariantIdsByProduct.get(v.productId)!.set(variantKey(v), v.id);
  }

  const newProducts: StagedProduct[] = [];
  const variantsToCreate = new Map<string, StagedVariantData[]>();
  const variantsToUpdate: StagedVariantUpdate[] = [];
  const duplicates: VariableImportDuplicateDetail[] = [];
  const newAttributeValueRows: { attribute: string; value: string; order: number }[] = [];
  let productsToCreate = 0;
  let productsReused = 0;
  let variantsToCreateCount = 0;
  let variantsToUpdateCount = 0;

  for (const [modelNumber, rows] of groups) {
    const firstRow = rows[0].cells;
    const firstRowNumber = rows[0].rowNumber;

    const categoryLookup = mapping.categoryMatchBy === "importReference" ? categoryByImportReference : categoryByName;
    const category = resolveClassificationValue(
      mapping.categoryMatchBy === "importReference" ? "Category (Import Reference)" : "Category",
      mapping.classification.category,
      firstRow,
      categoryLookup,
      true
    );
    if (!category.ok) {
      errors.push({ rowNumber: firstRowNumber, modelNumber, reason: category.reason });
      continue;
    }
    const companyId = categoryCompanyId.get(category.id!)!;

    const subCategoryLookup =
      mapping.subCategoryMatchBy === "importReference"
        ? (subCategoriesByCategoryByImportReference.get(category.id!) ?? new Map())
        : (subCategoriesByCategory.get(category.id!) ?? new Map());
    const subCategory = resolveClassificationValue(
      mapping.subCategoryMatchBy === "importReference" ? "Sub-Category (Import Reference)" : "Sub-Category",
      mapping.classification.subCategory,
      firstRow,
      subCategoryLookup,
      false
    );
    if (!subCategory.ok) {
      errors.push({ rowNumber: firstRowNumber, modelNumber, reason: subCategory.reason });
      continue;
    }
    if (subCategory.id && subCategoryParentCategoryId.get(subCategory.id) !== category.id) {
      errors.push({
        rowNumber: firstRowNumber,
        modelNumber,
        reason: `Sub-Category "${subCategoryNameById.get(subCategory.id) ?? subCategory.id}" does not belong to Category "${categoryNameById.get(category.id!) ?? category.id}"`,
      });
      continue;
    }

    const productFamily = resolveProductFamily(mapping.classification.productFamily, firstRow);
    if (!productFamily.ok) {
      errors.push({ rowNumber: firstRowNumber, modelNumber, reason: productFamily.reason });
      continue;
    }

    const name = (nameCol != null ? (firstRow[nameCol] ?? "").trim() : "") || modelNumber;
    const image = imageCol != null ? (firstRow[imageCol] ?? "").trim() || null : null;

    const existingProductId = existingProductIdByModelNumber.get(modelNumber);
    if (existingProductId) {
      productsReused++;
    } else {
      newProducts.push({
        modelNumber,
        name,
        image,
        productFamily: productFamily.id!,
        productType: "variable",
        companyId,
        categoryId: category.id!,
        subCategoryId: subCategory.id,
        images: image ? [image] : [],
        // Industries/sub-industries live per-variant for variable products (see below) — the
        // product record itself never carries them.
        industryIds: [],
        subIndustryIds: [],
        certificates: [],
        features: null,
        description: null,
        specifications: [],
        downloads: [],
      });
      productsToCreate++;
    }

    const existingKeyIds = existingProductId ? existingVariantIdsByProduct.get(existingProductId) ?? new Map() : new Map();
    const working = new Map<
      string,
      { status: "create" | "update"; variantId?: string; data: StagedVariantData; rowNumber: number }
    >();

    for (const row of rows) {
      const attrs: Record<ProductAttributeKey, string | null> = {
        size: null,
        variantType: null,
        orifice: null,
        minOperatingTemp: null,
        maxOperatingTemp: null,
        flowFactor: null,
      };
      for (const key of ATTRIBUTE_KEYS) {
        const col = attributeCols[key];
        const raw = col != null ? (row.cells[col] ?? "").trim() : "";
        attrs[key] = raw || null;
        if (raw && !existingAttrValues.get(key)!.has(raw)) {
          newAttributeValueRows.push({ attribute: key, value: raw, order: nextOrder.get(key)! });
          nextOrder.set(key, nextOrder.get(key)! + 1);
          existingAttrValues.get(key)!.add(raw);
        }
      }

      const key = variantKey(attrs);
      const certificates = certificatesCol != null
        ? (row.cells[certificatesCol] ?? "").split(/[;,]/).map((s) => s.trim()).filter(Boolean)
        : [];
      const features = featuresCol != null ? (row.cells[featuresCol] ?? "").trim() || null : null;
      const description = descriptionCol != null ? (row.cells[descriptionCol] ?? "").trim() || null : null;
      const specifications = specCols
        .map((col) => ({ key: columnLabel(col), value: (row.cells[col] ?? "").trim() }))
        .filter((s) => s.value);

      const industryIds: string[] = [];
      const pendingIndustryReferences: string[] = [];
      if (industryCol != null) {
        for (const token of splitReferences(row.cells[industryCol] ?? "")) {
          const resolved = resolveIndustryToken(token, industryIdByReference, industryReferences);
          if (resolved.kind === "id") industryIds.push(resolved.id);
          else if (resolved.kind === "pending") pendingIndustryReferences.push(resolved.reference);
          // "unresolved" tokens are skipped — the Map Industries step requires every distinct
          // token in the sheet to be mapped before the import can be committed.
        }
      }

      const subIndustryIds: string[] = [];
      const pendingSubIndustryReferences: string[] = [];
      if (subIndustryCol != null) {
        for (const token of splitReferences(row.cells[subIndustryCol] ?? "")) {
          const resolved = resolveSubIndustryToken(token, subIndustryIdByReference, subIndustryReferences);
          if (resolved.kind === "id") subIndustryIds.push(resolved.id);
          else if (resolved.kind === "pending") pendingSubIndustryReferences.push(resolved.reference);
        }
      }

      const data: StagedVariantData = {
        size: attrs.size,
        variantType: attrs.variantType,
        orifice: attrs.orifice,
        minOperatingTemp: attrs.minOperatingTemp,
        maxOperatingTemp: attrs.maxOperatingTemp,
        flowFactor: attrs.flowFactor,
        certificates,
        features,
        description,
        specifications,
        industryIds,
        pendingIndustryReferences,
        subIndustryIds,
        pendingSubIndustryReferences,
      };

      const existing = working.get(key);
      if (existing) {
        const reason =
          existing.status === "update"
            ? `Matches an existing variant — data from row ${row.rowNumber} will be used`
            : `Duplicate of row ${existing.rowNumber} in this file — data from row ${row.rowNumber} will be used`;
        duplicates.push({ rowNumber: row.rowNumber, modelNumber, variantLabel: variantLabel(attrs), reason });
        working.set(key, { ...existing, data, rowNumber: row.rowNumber });
        continue;
      }

      const existingVariantId = existingKeyIds.get(key);
      working.set(key, {
        status: existingVariantId ? "update" : "create",
        variantId: existingVariantId,
        data,
        rowNumber: row.rowNumber,
      });
    }

    const stagedCreates: StagedVariantData[] = [];
    for (const entry of working.values()) {
      if (entry.status === "create") {
        stagedCreates.push(entry.data);
        variantsToCreateCount++;
      } else {
        variantsToUpdate.push({ variantId: entry.variantId!, data: entry.data });
        variantsToUpdateCount++;
      }
    }
    if (stagedCreates.length) variantsToCreate.set(modelNumber, stagedCreates);
  }

  const newIndustries = industryReferences
    .filter((r): r is IndustryReferenceMapping & { target: { kind: "create"; name: string } } => r.target.kind === "create")
    .map((r) => ({ reference: r.reference, name: r.target.name }));
  const newSubIndustries = subIndustryReferences
    .filter(
      (r): r is SubIndustryReferenceMapping & { target: { kind: "create"; name: string; parentIndustryReference: string } } =>
        r.target.kind === "create"
    )
    .map((r) => ({ reference: r.reference, name: r.target.name, parentIndustryReference: r.target.parentIndustryReference }));

  return {
    summary: {
      totalDataRows: dataRows.length,
      groupCount: groups.size,
      productsToCreate,
      productsReused,
      variantsToCreate: variantsToCreateCount,
      variantsToUpdate: variantsToUpdateCount,
      newAttributeValues: newAttributeValueRows.map(({ attribute, value }) => ({ attribute, value })),
      newIndustries,
      newSubIndustries,
      errors,
      duplicates,
    },
    newProducts,
    variantsToCreate,
    variantsToUpdate,
    existingProductIdByModelNumber,
    newAttributeValueRows,
    industryReferences,
    subIndustryReferences,
  };
}

export async function applyVariableProductImportPlan(plan: VariableImportPlan) {
  return prisma.$transaction(
    async (tx) => {
      if (plan.newAttributeValueRows.length) {
        await tx.attributeValue.createMany({ data: plan.newAttributeValueRows });
      }

      // Resolve every "create new" industry/sub-industry reference first, so every product/variant
      // built below can connect to a real id whether it references an existing or brand-new record.
      // New records get bare-minimum stub content — they're expected to be fleshed out afterward in
      // the Industries admin section.
      const industryIdByReference = new Map<string, string>();
      let createdIndustryCount = 0;
      for (const ref of plan.industryReferences) {
        if (ref.target.kind !== "create") continue;
        const slugBase = slugify(ref.target.name) || slugify(ref.reference);
        let slug = slugBase;
        let suffix = 1;
        while (await tx.industry.findUnique({ where: { slug } })) {
          slug = `${slugBase}-${suffix++}`;
        }
        const created = await tx.industry.create({
          data: {
            name: ref.target.name,
            slug,
            importReference: ref.reference,
            description: "",
            sectionTitle: "",
            overview: "",
            stats: [],
            whyChoose: { title: "", highlight: "", cards: [] },
          },
        });
        industryIdByReference.set(ref.reference.toLowerCase(), created.id);
        createdIndustryCount++;
      }

      const subIndustryIdByReference = new Map<string, string>();
      let createdSubIndustryCount = 0;
      for (const ref of plan.subIndustryReferences) {
        if (ref.target.kind !== "create") continue;
        const parentIndustryId = industryIdByReference.get(ref.target.parentIndustryReference.toLowerCase());
        if (!parentIndustryId) continue; // the wizard requires this to resolve before commit
        const slugBase = slugify(ref.target.name) || slugify(ref.reference);
        let slug = slugBase;
        let suffix = 1;
        while (
          await tx.subIndustry.findUnique({ where: { industryId_slug: { industryId: parentIndustryId, slug } } })
        ) {
          slug = `${slugBase}-${suffix++}`;
        }
        const created = await tx.subIndustry.create({
          data: {
            name: ref.target.name,
            slug,
            importReference: ref.reference,
            industryId: parentIndustryId,
            description: "",
            challengesTitle: "",
            solutionsTitle: "",
            challenges: [],
            solutions: [],
            recommendedProducts: [],
          },
        });
        subIndustryIdByReference.set(ref.reference.toLowerCase(), created.id);
        createdSubIndustryCount++;
      }

      function finalIndustryIds(data: { industryIds: string[]; pendingIndustryReferences: string[] }): string[] {
        const resolved = data.pendingIndustryReferences
          .map((ref) => industryIdByReference.get(ref.toLowerCase()))
          .filter((id): id is string => Boolean(id));
        return [...data.industryIds, ...resolved];
      }
      function finalSubIndustryIds(data: { subIndustryIds: string[]; pendingSubIndustryReferences: string[] }): string[] {
        const resolved = data.pendingSubIndustryReferences
          .map((ref) => subIndustryIdByReference.get(ref.toLowerCase()))
          .filter((id): id is string => Boolean(id));
        return [...data.subIndustryIds, ...resolved];
      }

      const productIdByModelNumber = new Map(plan.existingProductIdByModelNumber);
      for (const product of plan.newProducts) {
        const { modelNumber, name, industryIds, subIndustryIds, ...rest } = product;
        void industryIds; // bulk-imported products never carry industries themselves — see StagedProduct
        void subIndustryIds;
        const created = await tx.product.create({
          data: { ...rest, name, modelNumber, slug: slugify(`${name}-${modelNumber}`) },
        });
        productIdByModelNumber.set(modelNumber, created.id);
      }

      // Variants need per-row relation `connect`s, which `createMany` can't express — so these are
      // created one at a time rather than in bulk chunks.
      let createdVariantCount = 0;
      for (const [modelNumber, variants] of plan.variantsToCreate) {
        const productId = productIdByModelNumber.get(modelNumber);
        if (!productId) continue;
        for (const v of variants) {
          const { industryIds, pendingIndustryReferences, subIndustryIds, pendingSubIndustryReferences, ...scalars } = v;
          await tx.productVariant.create({
            data: {
              ...scalars,
              productId,
              downloads: [],
              industries: { connect: finalIndustryIds({ industryIds, pendingIndustryReferences }).map((id) => ({ id })) },
              subIndustries: {
                connect: finalSubIndustryIds({ subIndustryIds, pendingSubIndustryReferences }).map((id) => ({ id })),
              },
            },
          });
          createdVariantCount++;
        }
      }

      for (const { variantId, data } of plan.variantsToUpdate) {
        const {
          size,
          variantType,
          orifice,
          minOperatingTemp,
          maxOperatingTemp,
          flowFactor,
          certificates,
          features,
          description,
          specifications,
        } = data;
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            size,
            variantType,
            orifice,
            minOperatingTemp,
            maxOperatingTemp,
            flowFactor,
            certificates,
            features,
            description,
            specifications,
            industries: { set: finalIndustryIds(data).map((id) => ({ id })) },
            subIndustries: { set: finalSubIndustryIds(data).map((id) => ({ id })) },
          },
        });
      }

      return {
        createdProductCount: plan.newProducts.length,
        createdVariantCount,
        updatedVariantCount: plan.variantsToUpdate.length,
        createdAttributeValueCount: plan.newAttributeValueRows.length,
        createdIndustryCount,
        createdSubIndustryCount,
      };
    },
    { timeout: 30_000 }
  );
}
