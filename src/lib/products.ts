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

export async function getAttributeValuesByKey(): Promise<Record<string, string[]>> {
  const rows = await prisma.attributeValue.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const grouped: Record<string, string[]> = {};
  for (const attr of PRODUCT_ATTRIBUTES) grouped[attr.key] = [];
  for (const row of rows) {
    if (!grouped[row.attribute]) grouped[row.attribute] = [];
    grouped[row.attribute].push(row.value);
  }
  return grouped;
}
