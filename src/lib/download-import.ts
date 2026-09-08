import { prisma } from "@/lib/prisma";
import { cleanDownloadName, resolveDownloadColumns, type DownloadImportGrid } from "@/lib/download-grid";
import { PRODUCT_ATTRIBUTES, type ProductAttributeKey } from "@/lib/product-constants";

const ATTRIBUTE_KEYS = PRODUCT_ATTRIBUTES.map((a) => a.key);

export type DownloadCategoryMatchBy = "name" | "importReference";

export type DownloadCategoryMapping = {
  sheetColumn: number;
  headerText: string;
  matchBy: DownloadCategoryMatchBy;
  target: { kind: "existing"; categoryId: string } | { kind: "create"; importReference?: string };
};

export type DownloadImportMapping = {
  modelNumberColumn: number;
  attributeColumns: Partial<Record<ProductAttributeKey, number>>;
  bannerRow: number;
  categories: DownloadCategoryMapping[];
};

export type DownloadImportRowError = { rowNumber: number; modelNumber: string | null; reason: string };

export type DownloadImportEntryPreview = {
  rowNumber: number;
  modelNumber: string;
  variantLabel: string;
  categoryName: string;
  title: string;
  url: string;
};

export type DownloadImportSummary = {
  totalDataRows: number;
  categoriesToCreate: string[];
  targetsToUpdate: number;
  entriesToAdd: number;
  entries: DownloadImportEntryPreview[];
  skippedEmpty: number;
  errors: DownloadImportRowError[];
};

type DownloadTarget = { kind: "product" | "variant"; id: string };

type StagedEntry = {
  rowNumber: number;
  modelNumber: string;
  variantLabel: string;
  target: DownloadTarget;
  categoryName: string;
  categoryId?: string; // set when matched to an existing category; unset means "use the created id for categoryName"
  title: string;
  url: string;
};

type NewCategory = { name: string; importReference?: string };

export type DownloadImportPlan = {
  summary: DownloadImportSummary;
  categoriesToCreate: NewCategory[];
  entries: StagedEntry[];
};

function emptyPlan(reason: string): DownloadImportPlan {
  return {
    summary: {
      totalDataRows: 0,
      categoriesToCreate: [],
      targetsToUpdate: 0,
      entriesToAdd: 0,
      entries: [],
      skippedEmpty: 0,
      errors: [{ rowNumber: 0, modelNumber: null, reason }],
    },
    categoriesToCreate: [],
    entries: [],
  };
}

function attributeKey(attrs: Partial<Record<ProductAttributeKey, string | null>>): string {
  return ATTRIBUTE_KEYS.map((k) => attrs[k] ?? "").join("");
}

function attributeLabel(attrs: Partial<Record<ProductAttributeKey, string | null>>): string {
  return ATTRIBUTE_KEYS.map((k) => attrs[k])
    .filter(Boolean)
    .join(" / ");
}

export async function analyzeDownloadImport(
  grid: DownloadImportGrid,
  mapping: DownloadImportMapping
): Promise<DownloadImportPlan> {
  const resolved = resolveDownloadColumns(grid, mapping.bannerRow);
  if (!resolved.ok) return emptyPlan(resolved.error);

  const subHeaderRowIndex = mapping.bannerRow; // 0-indexed array position of the row right after the banner
  const dataRows = grid
    .slice(subHeaderRowIndex + 1)
    .map((cells, i) => ({ rowNumber: subHeaderRowIndex + 2 + i, cells }));

  const errors: DownloadImportRowError[] = [];

  const existingCategories = await prisma.downloadCategory.findMany();

  type ResolvedCategory = { name: string; id?: string };
  const categoryByColumn = new Map<number, ResolvedCategory>();
  const categoriesToCreate = new Map<string, NewCategory>();
  for (const catMap of mapping.categories) {
    const target = catMap.target;
    if (target.kind === "existing") {
      const cat = existingCategories.find((c) => c.id === target.categoryId);
      categoryByColumn.set(catMap.sheetColumn, { name: cat?.name ?? catMap.headerText, id: target.categoryId });
    } else {
      categoryByColumn.set(catMap.sheetColumn, { name: catMap.headerText });
      categoriesToCreate.set(catMap.headerText, { name: catMap.headerText, importReference: target.importReference });
    }
  }

  const modelNumbers = new Set<string>();
  for (const row of dataRows) {
    const mn = (row.cells[mapping.modelNumberColumn]?.text ?? "").trim();
    if (mn) modelNumbers.add(mn);
  }

  const products = await prisma.product.findMany({
    where: { modelNumber: { in: [...modelNumbers] } },
    select: { id: true, modelNumber: true, productType: true, downloads: true },
  });
  const productByModelNumber = new Map(products.map((p) => [p.modelNumber, p] as const));

  const variableProductIds = products.filter((p) => p.productType === "variable").map((p) => p.id);
  const variants = variableProductIds.length
    ? await prisma.productVariant.findMany({
        where: { productId: { in: variableProductIds } },
        select: {
          id: true,
          productId: true,
          size: true,
          variantType: true,
          orifice: true,
          minOperatingTemp: true,
          maxOperatingTemp: true,
          flowFactor: true,
          downloads: true,
        },
      })
    : [];
  const variantsByProduct = new Map<string, Map<string, (typeof variants)[number]>>();
  const variantById = new Map(variants.map((v) => [v.id, v] as const));
  for (const v of variants) {
    if (!variantsByProduct.has(v.productId)) variantsByProduct.set(v.productId, new Map());
    variantsByProduct
      .get(v.productId)!
      .set(attributeKey({ size: v.size, variantType: v.variantType, orifice: v.orifice, minOperatingTemp: v.minOperatingTemp, maxOperatingTemp: v.maxOperatingTemp, flowFactor: v.flowFactor }), v);
  }

  const existingDownloadsByTarget = new Map<string, { title: string; url: string }[]>();
  const entries: StagedEntry[] = [];
  const touchedTargets = new Set<string>();
  let skippedEmpty = 0;

  for (const row of dataRows) {
    if (row.cells.every((c) => !c || !c.text.trim())) continue;

    const modelNumber = (row.cells[mapping.modelNumberColumn]?.text ?? "").trim();
    if (!modelNumber) {
      errors.push({ rowNumber: row.rowNumber, modelNumber: null, reason: "Missing Model Number" });
      continue;
    }

    const product = productByModelNumber.get(modelNumber);
    if (!product) {
      errors.push({ rowNumber: row.rowNumber, modelNumber, reason: `Product with Model Number "${modelNumber}" not found` });
      continue;
    }

    let target: DownloadTarget;
    let variantLabelStr = "";

    if (product.productType === "variable") {
      const attrs: Partial<Record<ProductAttributeKey, string | null>> = {};
      for (const key of ATTRIBUTE_KEYS) {
        const col = mapping.attributeColumns[key];
        attrs[key] = col != null ? (row.cells[col]?.text ?? "").trim() || null : null;
      }
      const key = attributeKey(attrs);
      const variant = variantsByProduct.get(product.id)?.get(key);
      if (!variant) {
        const label = attributeLabel(attrs);
        errors.push({
          rowNumber: row.rowNumber,
          modelNumber,
          reason: `No variant of "${modelNumber}" matches${label ? ` ${label}` : " the mapped attributes"}`,
        });
        continue;
      }
      target = { kind: "variant", id: variant.id };
      variantLabelStr = attributeLabel(attrs);
    } else {
      target = { kind: "product", id: product.id };
    }

    const targetKey = `${target.kind}:${target.id}`;
    if (!existingDownloadsByTarget.has(targetKey)) {
      const current = target.kind === "product" ? product.downloads : variantById.get(target.id)?.downloads;
      existingDownloadsByTarget.set(targetKey, Array.isArray(current) ? current : []);
    }
    const existingForTarget = existingDownloadsByTarget.get(targetKey)!;

    for (const [col, catInfo] of categoryByColumn) {
      const cell = row.cells[col];
      if (!cell) continue;
      for (const link of cell.links) {
        const title = cleanDownloadName(link.text);
        const url = link.href.trim();
        if (!title || !url) {
          skippedEmpty++;
          continue;
        }
        const alreadyExists = existingForTarget.some((d) => d.title === title && d.url === url);
        if (alreadyExists) continue;

        entries.push({
          rowNumber: row.rowNumber,
          modelNumber,
          variantLabel: variantLabelStr,
          target,
          categoryName: catInfo.name,
          categoryId: catInfo.id,
          title,
          url,
        });
        touchedTargets.add(targetKey);
      }
    }
  }

  return {
    summary: {
      totalDataRows: dataRows.length,
      categoriesToCreate: [...categoriesToCreate.keys()],
      targetsToUpdate: touchedTargets.size,
      entriesToAdd: entries.length,
      entries: entries.map(({ rowNumber, modelNumber, variantLabel, categoryName, title, url }) => ({
        rowNumber,
        modelNumber,
        variantLabel,
        categoryName,
        title,
        url,
      })),
      skippedEmpty,
      errors,
    },
    categoriesToCreate: [...categoriesToCreate.values()],
    entries,
  };
}

export async function applyDownloadImportPlan(plan: DownloadImportPlan) {
  return prisma.$transaction(
    async (tx) => {
      const categoryIdByName = new Map<string, string>();
      for (const { name, importReference } of plan.categoriesToCreate) {
        // A category with this name may already exist if the DB changed between preview and
        // commit (e.g. someone added it by hand) — fall back to reusing it instead of failing
        // the whole import on the unique constraint.
        const category = await tx.downloadCategory.upsert({
          where: { name },
          create: { name, importReference },
          update: {},
        });
        categoryIdByName.set(name, category.id);
      }

      const byTarget = new Map<string, { target: DownloadTarget; additions: { categoryId: string; title: string; url: string }[] }>();
      for (const e of plan.entries) {
        const categoryId = e.categoryId ?? categoryIdByName.get(e.categoryName);
        if (!categoryId) continue;
        const key = `${e.target.kind}:${e.target.id}`;
        if (!byTarget.has(key)) byTarget.set(key, { target: e.target, additions: [] });
        byTarget.get(key)!.additions.push({ categoryId, title: e.title, url: e.url });
      }

      let updatedTargetCount = 0;
      let addedEntryCount = 0;
      for (const { target, additions } of byTarget.values()) {
        const additionRows = additions.map((a) => ({
          title: a.title,
          description: "",
          url: a.url,
          categoryId: a.categoryId,
        }));
        if (target.kind === "product") {
          const product = await tx.product.findUniqueOrThrow({ where: { id: target.id }, select: { downloads: true } });
          const current = Array.isArray(product.downloads) ? product.downloads : [];
          await tx.product.update({ where: { id: target.id }, data: { downloads: [...current, ...additionRows] } });
        } else {
          const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: target.id }, select: { downloads: true } });
          const current = Array.isArray(variant.downloads) ? variant.downloads : [];
          await tx.productVariant.update({ where: { id: target.id }, data: { downloads: [...current, ...additionRows] } });
        }
        updatedTargetCount++;
        addedEntryCount += additions.length;
      }

      return {
        createdCategoryCount: plan.categoriesToCreate.length,
        updatedTargetCount,
        addedEntryCount,
      };
    },
    { timeout: 30_000 }
  );
}
