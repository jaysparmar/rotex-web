import { Prisma } from "@/generated/prisma/client";
import { PRODUCT_ATTRIBUTES } from "@/lib/product-constants";

export type ProductFilterParams = {
  q?: string;
  productType?: string;
  productFamily?: string;
  companyId?: string;
  categoryId?: string;
  subCategoryId?: string;
  industryId?: string;
  subIndustryId?: string;
  size?: string;
  variantType?: string;
  orifice?: string;
  minOperatingTemp?: string;
  maxOperatingTemp?: string;
  flowFactor?: string;
};

const ATTRIBUTE_KEYS = PRODUCT_ATTRIBUTES.map((a) => a.key);

export const FILTER_KEYS = [
  "productType",
  "productFamily",
  "companyId",
  "categoryId",
  "subCategoryId",
  "industryId",
  "subIndustryId",
  "size",
  "variantType",
  "orifice",
  "minOperatingTemp",
  "maxOperatingTemp",
  "flowFactor",
] as const satisfies readonly (keyof ProductFilterParams)[];

export function buildProductWhere(f: ProductFilterParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (f.q) where.OR = [{ name: { contains: f.q } }, { modelNumber: { contains: f.q } }];
  if (f.productType) where.productType = f.productType;
  if (f.productFamily) where.productFamily = f.productFamily;
  if (f.companyId) where.companyId = f.companyId;
  if (f.categoryId) where.categoryId = f.categoryId;
  if (f.subCategoryId) where.subCategoryId = f.subCategoryId;
  if (f.industryId) where.industryId = f.industryId;
  if (f.subIndustryId) where.subIndustryId = f.subIndustryId;

  const attrFilter: Record<string, string> = {};
  for (const key of ATTRIBUTE_KEYS) {
    const value = f[key];
    if (value) attrFilter[key] = value;
  }
  if (Object.keys(attrFilter).length) where.variants = { some: attrFilter };

  return where;
}
