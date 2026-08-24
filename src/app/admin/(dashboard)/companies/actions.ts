"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CompanyData = {
  name: string;
  slug: string;
};

type CategoryData = {
  name: string;
  slug: string;
  image?: string;
  mobileImage?: string;
  description?: string;
  order: number;
  importReference?: string;
};

type SubCategoryData = CategoryData;

function revalidateCompanies() {
  revalidatePath("/admin/companies");
}

export async function createCompany(data: CompanyData) {
  const company = await prisma.company.create({ data });
  revalidateCompanies();
  return { id: company.id };
}

export async function updateCompany(id: string, data: CompanyData) {
  await prisma.company.update({ where: { id }, data });
  revalidateCompanies();
}

export async function deleteCompany(id: string) {
  await prisma.company.delete({ where: { id } });
  revalidateCompanies();
}

export async function createCategory(companyId: string, data: CategoryData) {
  await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  const category = await prisma.category.create({ data: { ...data, companyId } });
  revalidateCompanies();
  return { id: category.id };
}

export async function updateCategory(id: string, data: CategoryData) {
  await prisma.category.update({ where: { id }, data });
  revalidateCompanies();
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidateCompanies();
}

export async function createSubCategory(categoryId: string, data: SubCategoryData) {
  await prisma.category.findUniqueOrThrow({ where: { id: categoryId } });
  const subCategory = await prisma.subCategory.create({ data: { ...data, categoryId } });
  revalidateCompanies();
  return { id: subCategory.id };
}

export async function updateSubCategory(id: string, data: SubCategoryData) {
  await prisma.subCategory.update({ where: { id }, data });
  revalidateCompanies();
}

export async function deleteSubCategory(id: string) {
  await prisma.subCategory.delete({ where: { id } });
  revalidateCompanies();
}
