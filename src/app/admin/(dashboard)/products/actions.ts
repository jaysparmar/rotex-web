"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type ContentFields = {
  certificates: string[];
  features: string | null;
  specifications: { key: string; value: string }[];
  downloads: { title: string; description: string; url: string }[];
};

export type ProductInput = ContentFields & {
  modelNumber: string;
  name: string;
  image: string | null;
  productFamily: string;
  productType: string;
  companyId: string;
  categoryId: string;
  subCategoryId: string | null;
  industryId: string | null;
  subIndustryId: string | null;
  industriesServed: string | null;
};

export type VariantInput = ContentFields & {
  size: string | null;
  variantType: string | null;
  orifice: string | null;
  minOperatingTemp: string | null;
  maxOperatingTemp: string | null;
  flowFactor: string | null;
};

function revalidateProducts(id?: string) {
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/admin/products/${id}`);
}

export async function createProduct(data: ProductInput) {
  const product = await prisma.product.create({
    data: { ...data, slug: slugify(`${data.name}-${data.modelNumber}`) },
  });
  revalidateProducts();
  return { id: product.id };
}

export async function updateProduct(id: string, data: ProductInput) {
  await prisma.product.update({ where: { id }, data });
  revalidateProducts(id);
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidateProducts(id);
}

export async function createVariant(productId: string, data: VariantInput) {
  await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const variant = await prisma.productVariant.create({ data: { ...data, productId } });
  revalidateProducts(productId);
  return { id: variant.id };
}

export async function updateVariant(id: string, data: VariantInput) {
  const variant = await prisma.productVariant.update({ where: { id }, data });
  revalidateProducts(variant.productId);
}

export async function deleteVariant(id: string) {
  const variant = await prisma.productVariant.delete({ where: { id } });
  revalidateProducts(variant.productId);
}
