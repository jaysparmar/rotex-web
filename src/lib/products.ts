import { prisma } from "@/lib/prisma";
import { PRODUCT_ATTRIBUTES } from "@/lib/product-constants";

export async function getCompanyCategoryTree() {
  return prisma.company.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      categories: {
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          importReference: true,
          subCategories: {
            orderBy: [{ order: "asc" }, { name: "asc" }],
            select: { id: true, name: true, importReference: true },
          },
        },
      },
    },
  });
}

export async function getIndustryTree() {
  return prisma.industry.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      importReference: true,
      subIndustries: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, importReference: true },
      },
    },
  });
}

// Parses plain numbers ("0.8"), simple fractions ("1/8\"", "3/4"), and mixed
// numbers ("1 1/4\"") into a comparable number; returns null for anything
// else (e.g. "Female BSP/NPT Threads") so non-numeric attributes are left
// in their DB-defined order.
function parseNumericValue(value: string): number | null {
  const cleaned = value.trim().replace(/["”]/g, "");

  const mixed = cleaned.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (mixed) {
    const denominator = Number(mixed[3]);
    return denominator !== 0 ? Number(mixed[1]) + Number(mixed[2]) / denominator : null;
  }

  const fraction = cleaned.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    return denominator !== 0 ? Number(fraction[1]) / denominator : null;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// The "Filter by attribute" dropdowns must only ever offer values that some
// product in the current scope actually has — otherwise picking "Actuators"
// still shows Solenoid Valve options like Orifice or Flow Factor, which no
// Actuator product carries. Derives values straight from ProductVariant
// (the fields the filter actually queries against), scoped to a category
// when given, rather than the flat admin-managed AttributeValue taxonomy —
// that table has no category relation and would leak values across families.
export async function getAttributeValuesByKey(categorySlug?: string | null): Promise<Record<string, string[]>> {
  const variants = await prisma.productVariant.findMany({
    where: categorySlug ? { product: { category: { slug: categorySlug } } } : undefined,
    select: {
      size: true,
      variantType: true,
      orifice: true,
      minOperatingTemp: true,
      maxOperatingTemp: true,
      flowFactor: true,
    },
  });

  const grouped: Record<string, string[]> = {};
  for (const attr of PRODUCT_ATTRIBUTES) {
    const seen = new Set<string>();
    for (const variant of variants) {
      const value = variant[attr.key as keyof typeof variant];
      if (value) seen.add(value);
    }
    grouped[attr.key] = [...seen];
  }

  // Numeric-looking attributes (Size, Orifice, Flow Factor, temperatures) sort
  // ascending by parsed value regardless of admin-set DB order; anything with
  // a non-numeric value (e.g. Variant Type) is left as-is.
  for (const key of Object.keys(grouped)) {
    const values = grouped[key];
    const parsed = values.map(parseNumericValue);
    if (parsed.every((n) => n !== null)) {
      grouped[key] = values
        .map((value, i) => ({ value, n: parsed[i] as number }))
        .sort((a, b) => a.n - b.n)
        .map((entry) => entry.value);
    }
  }

  return grouped;
}
