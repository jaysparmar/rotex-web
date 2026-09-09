"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { buildProductWhere, type ProductFilterParams } from "@/lib/product-filters";

function isDuplicateProductError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

type ContentFields = {
  certificates: string[];
  industryIds: string[];
  subIndustryIds: string[];
  features: string | null;
  description: string | null;
  specifications: { key: string; value: string }[];
  downloads: {
    title: string;
    description: string;
    url: string;
    categoryId: string;
    tab?: string;
  }[];
};

export type ProductInput = ContentFields & {
  modelNumber: string;
  name: string;
  image: string | null;
  images: string[];
  productFamily: string;
  productType: string;
  companyId: string;
  categoryId: string;
  subCategoryId: string | null;
};

export type VariantInput = ContentFields & {
  size: string | null;
  variantType: string | null;
  orifice: string | null;
  minOperatingTemp: string | null;
  maxOperatingTemp: string | null;
  flowFactor: string | null;
};

function connectIndustries(industryIds: string[], subIndustryIds: string[]) {
  return {
    industries: { connect: industryIds.map((id) => ({ id })) },
    subIndustries: { connect: subIndustryIds.map((id) => ({ id })) },
  };
}

function setIndustries(industryIds: string[], subIndustryIds: string[]) {
  return {
    industries: { set: industryIds.map((id) => ({ id })) },
    subIndustries: { set: subIndustryIds.map((id) => ({ id })) },
  };
}

function revalidateProducts(id?: string) {
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/admin/products/${id}`);
  revalidatePath("/downloads");
}

export async function createProduct(data: ProductInput) {
  const { industryIds, subIndustryIds, ...rest } = data;
  try {
    const product = await prisma.product.create({
      data: {
        ...rest,
        slug: slugify(`${data.name}-${data.modelNumber}`),
        ...connectIndustries(industryIds, subIndustryIds),
      },
    });
    revalidateProducts();
    return { id: product.id };
  } catch (err) {
    if (isDuplicateProductError(err)) {
      throw new Error("A product with this Model Number already exists.");
    }
    throw err;
  }
}

export async function updateProduct(id: string, data: ProductInput) {
  const { industryIds, subIndustryIds, ...rest } = data;
  try {
    await prisma.product.update({
      where: { id },
      data: { ...rest, ...setIndustries(industryIds, subIndustryIds) },
    });
    revalidateProducts(id);
  } catch (err) {
    if (isDuplicateProductError(err)) {
      throw new Error("A product with this Model Number already exists.");
    }
    throw err;
  }
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidateProducts(id);
}

export async function deleteProducts(ids: string[]) {
  const result = await prisma.product.deleteMany({ where: { id: { in: ids } } });
  revalidateProducts();
  return { count: result.count };
}

export async function countProductsByFilter(filter: ProductFilterParams) {
  return prisma.product.count({ where: buildProductWhere(filter) });
}

export async function deleteProductsByFilter(filter: ProductFilterParams) {
  const result = await prisma.product.deleteMany({ where: buildProductWhere(filter) });
  revalidateProducts();
  return { count: result.count };
}

export async function createVariant(productId: string, data: VariantInput) {
  await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const { industryIds, subIndustryIds, ...rest } = data;
  const variant = await prisma.productVariant.create({
    data: { ...rest, productId, ...connectIndustries(industryIds, subIndustryIds) },
  });
  revalidateProducts(productId);
  return { id: variant.id };
}

export async function updateVariant(id: string, data: VariantInput) {
  const { industryIds, subIndustryIds, ...rest } = data;
  const variant = await prisma.productVariant.update({
    where: { id },
    data: { ...rest, ...setIndustries(industryIds, subIndustryIds) },
  });
  revalidateProducts(variant.productId);
}

export async function deleteVariant(id: string) {
  const variant = await prisma.productVariant.delete({ where: { id } });
  revalidateProducts(variant.productId);
}
