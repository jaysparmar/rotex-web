"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getFormConfig, getProductTypeConfig, FORM_FIELDS, PRODUCT_TYPE_OPTIONS, type FormKey } from "@/lib/form-config";

export async function saveFormFields(
  formKey: FormKey,
  fields: Record<string, boolean>,
  industryIds: string[],
  enquiryTypeOrder: string[]
) {
  const current = await getFormConfig();

  // Locked fields always stay on regardless of what the client sends.
  const sanitizedFields: Record<string, boolean> = { ...fields };
  for (const f of FORM_FIELDS) {
    if (f.locked) sanitizedFields[f.key] = true;
  }

  const next: PrismaJson.FormConfigData = {
    ...current,
    [formKey]: { fields: sanitizedFields, industryIds, enquiryTypeOrder },
  };

  await prisma.formConfig.upsert({
    where: { id: "forms" },
    update: { data: next as never },
    create: { id: "forms", data: next as never },
  });

  revalidatePath("/admin/forms");
  revalidatePath(`/admin/forms/${formKey}`);
  revalidatePath("/", "layout");
}

export async function saveProductTypeConfig(data: { key: string; label: string }[]) {
  const fixedKeys = new Set<string>(PRODUCT_TYPE_OPTIONS);
  // Only the order and label are admin-controlled — the key set itself stays fixed.
  const sanitized = data
    .filter((o) => fixedKeys.has(o.key))
    .map((o) => ({ key: o.key, label: o.label.trim() || o.key }));
  const current = await getProductTypeConfig();
  const missing = current.filter((o) => !sanitized.some((s) => s.key === o.key));
  const next: PrismaJson.ProductTypeList = [...sanitized, ...missing];

  await prisma.productTypeConfig.upsert({
    where: { id: "product-types" },
    update: { data: next as never },
    create: { id: "product-types", data: next as never },
  });

  revalidatePath("/admin/forms");
  revalidatePath("/", "layout");
}
