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
  power: string | null;
  /** Variant photo. Left out = keep whatever the variant already has. */
  image?: string | null;
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
  // Public PLP (/products) and every product detail page (/products/[slug])
  // were never invalidated here, so saved changes (e.g. industries) never
  // showed up on the storefront until an unrelated full rebuild.
  revalidatePath("/products", "layout");
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

// Drag-reorder on the admin list, one page at a time — `pageOffset` is the
// 0-based index of the page's first row in the unfiltered, order-sorted list,
// so each page claims its own slice of the order space (page N -> [N*pageSize,
// (N+1)*pageSize)) without colliding with rows on other pages.
export async function reorderProducts(orderedIds: string[], pageOffset: number) {
  await prisma.$transaction(
    orderedIds.map((id, i) => prisma.product.update({ where: { id }, data: { order: pageOffset + i } }))
  );
  revalidateProducts();
}

// Appends "-copy", then "-copy-2", "-copy-3", ... until the value is free.
async function dedupeField(
  field: "slug" | "modelNumber",
  base: string
): Promise<string> {
  let candidate = `${base}-copy`;
  let n = 2;
  while (
    await prisma.product.findUnique({
      where: field === "slug" ? { slug: candidate } : { modelNumber: candidate },
      select: { id: true },
    })
  ) {
    candidate = `${base}-copy-${n}`;
    n += 1;
  }
  return candidate;
}

export async function duplicateProduct(id: string) {
  const source = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: {
      industries: { select: { id: true } },
      subIndustries: { select: { id: true } },
      variants: {
        include: {
          industries: { select: { id: true } },
          subIndustries: { select: { id: true } },
        },
      },
    },
  });

  const {
    id: _id,
    modelNumber,
    slug,
    industries,
    subIndustries,
    variants,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...rest
  } = source;

  const [newModelNumber, newSlug] = await Promise.all([
    dedupeField("modelNumber", modelNumber),
    dedupeField("slug", slug),
  ]);

  const clone = await prisma.product.create({
    data: {
      ...rest,
      modelNumber: newModelNumber,
      slug: newSlug,
      industries: { connect: industries.map((i) => ({ id: i.id })) },
      subIndustries: { connect: subIndustries.map((i) => ({ id: i.id })) },
      variants: {
        create: variants.map((v) => {
          const {
            id: _vid,
            productId: _pid,
            industries: vIndustries,
            subIndustries: vSubIndustries,
            createdAt: _vCreatedAt,
            updatedAt: _vUpdatedAt,
            ...variantRest
          } = v;
          return {
            ...variantRest,
            industries: { connect: vIndustries.map((i) => ({ id: i.id })) },
            subIndustries: { connect: vSubIndustries.map((i) => ({ id: i.id })) },
          };
        }),
      },
    },
  });

  revalidateProducts();
  return { id: clone.id };
}
