import { Prisma } from "@/generated/prisma/client";

export const SUPPLIER_TAB = "Supplier Applications";
export const CHANNEL_PARTNER_TAB = "Channel Partner Applications";
export const OTHER_TAB = "Other";

// Non-industry sources get their own tab instead of being grouped (or
// incorrectly falling into "Other") by industry name — their form isn't
// industry-specific the way the Contact/Industry/Product-Quote forms are.
const NON_INDUSTRY_SOURCES = ["supplier", "channel-partner"] as const;

// The Supplier form reuses this table but has no real "product" — it sends
// this literal placeholder to satisfy the NOT NULL column. Hide it in the UI.
export const NO_PRODUCT_PLACEHOLDER = "Supplier Application";

export type EnquiryDateRange = { from?: string; to?: string };

/** `tab` is either an industry name, SUPPLIER_TAB, CHANNEL_PARTNER_TAB, OTHER_TAB, or "" (no tabs at all). */
export function buildEnquiryWhere(
  tab: string,
  industryNames: string[],
  product?: string,
  dateRange?: EnquiryDateRange
): Prisma.EnquiryWhereInput {
  const where: Prisma.EnquiryWhereInput = {};

  if (tab === SUPPLIER_TAB) {
    where.source = "supplier";
  } else if (tab === CHANNEL_PARTNER_TAB) {
    where.source = "channel-partner";
  } else if (tab === OTHER_TAB) {
    where.source = { notIn: [...NON_INDUSTRY_SOURCES] };
    where.industryName = { notIn: industryNames };
  } else if (tab) {
    where.source = { notIn: [...NON_INDUSTRY_SOURCES] };
    where.industryName = tab;
  } else {
    where.id = "__none__";
  }

  if (product) where.product = product;

  if (dateRange?.from || dateRange?.to) {
    where.createdAt = {};
    if (dateRange.from) where.createdAt.gte = new Date(`${dateRange.from}T00:00:00.000Z`);
    if (dateRange.to) where.createdAt.lte = new Date(`${dateRange.to}T23:59:59.999Z`);
  }

  return where;
}
