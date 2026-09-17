import { Prisma } from "@/generated/prisma/client";

export const SUPPLIER_TAB = "Supplier Applications";
export const OTHER_TAB = "Other";

// The Supplier form reuses this table but has no real "product" — it sends
// this literal placeholder to satisfy the NOT NULL column. Hide it in the UI.
export const NO_PRODUCT_PLACEHOLDER = "Supplier Application";

/** `tab` is either an industry name, SUPPLIER_TAB, OTHER_TAB, or "" (no tabs at all). */
export function buildEnquiryWhere(tab: string, industryNames: string[], product?: string): Prisma.EnquiryWhereInput {
  const where: Prisma.EnquiryWhereInput = {};

  if (tab === SUPPLIER_TAB) {
    where.source = "supplier";
  } else if (tab === OTHER_TAB) {
    where.source = { not: "supplier" };
    where.industryName = { notIn: industryNames };
  } else if (tab) {
    where.source = { not: "supplier" };
    where.industryName = tab;
  } else {
    where.id = "__none__";
  }

  if (product) where.product = product;

  return where;
}
