"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getFormConfig, FORM_FIELDS, type FormKey } from "@/lib/form-config";

export async function saveFormFields(formKey: FormKey, fields: Record<string, boolean>, industryIds: string[]) {
  const current = await getFormConfig();

  // Locked fields always stay on regardless of what the client sends.
  const sanitizedFields: Record<string, boolean> = { ...fields };
  for (const f of FORM_FIELDS) {
    if (f.locked) sanitizedFields[f.key] = true;
  }

  const next: PrismaJson.FormConfigData = {
    ...current,
    [formKey]: { fields: sanitizedFields, industryIds },
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
