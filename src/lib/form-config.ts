import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  FORMS,
  DEFAULT_FORM_CONFIG,
  DEFAULT_PRODUCT_TYPE_CONFIG,
  PRODUCT_TYPE_OPTIONS,
  ENQUIRY_TYPE_OPTIONS_BY_FORM,
  type FormKey,
  type FormFieldKey,
} from "@/lib/form-config-shared";

export {
  FORM_FIELDS,
  FORMS,
  PRODUCT_TYPE_OPTIONS,
  ENQUIRY_TYPE_OPTIONS_BY_FORM,
  type FormFieldKey,
  type FormKey,
} from "@/lib/form-config-shared";

export const getFormConfig = cache(async (): Promise<PrismaJson.FormConfigData> => {
  const row = await prisma.formConfig.upsert({
    where: { id: "forms" },
    update: {},
    create: { id: "forms", data: DEFAULT_FORM_CONFIG as never },
  });
  const data = row.data as PrismaJson.FormConfigData;

  // Backfill any form/field added since a site was first set up, so a stale
  // saved row never hides a field just because it didn't exist yet.
  const merged: PrismaJson.FormConfigData = {};
  for (const form of FORMS) {
    const saved = data[form.key];
    const defaults = DEFAULT_FORM_CONFIG[form.key];
    const fixedOptions = ENQUIRY_TYPE_OPTIONS_BY_FORM[form.key];
    merged[form.key] = {
      fields: { ...defaults.fields, ...saved?.fields },
      industryIds: saved?.industryIds ?? defaults.industryIds,
      enquiryTypeOrder: sanitizeOrder(saved?.enquiryTypeOrder ?? defaults.enquiryTypeOrder, fixedOptions),
    };
  }
  return merged;
});

// Keeps an admin-saved order limited to the current fixed option set — drops any option
// that's no longer valid and appends any new one the admin hasn't ordered yet.
function sanitizeOrder(saved: string[] | undefined, fixed: readonly string[] | undefined): string[] | undefined {
  if (!fixed) return undefined;
  const kept = (saved ?? []).filter((o) => fixed.includes(o));
  const missing = fixed.filter((o) => !kept.includes(o));
  return [...kept, ...missing];
}

export const getProductTypeConfig = cache(async (): Promise<PrismaJson.ProductTypeList> => {
  const row = await prisma.productTypeConfig.upsert({
    where: { id: "product-types" },
    update: {},
    create: { id: "product-types", data: DEFAULT_PRODUCT_TYPE_CONFIG as never },
  });
  const saved = (row.data as PrismaJson.ProductTypeList) ?? [];

  // Same backfill logic as form fields — drop stale keys, append any new canonical option.
  const kept = saved.filter((o) => (PRODUCT_TYPE_OPTIONS as readonly string[]).includes(o.key));
  const missing = PRODUCT_TYPE_OPTIONS.filter((key) => !kept.some((o) => o.key === key)).map((key) => ({
    key,
    label: key,
  }));
  return [...kept, ...missing];
});

export function isFieldEnabled(config: PrismaJson.FormConfigData, formKey: FormKey, field: FormFieldKey): boolean {
  return config[formKey]?.fields?.[field] ?? true;
}

export type IndustryTreeRow = { id: string; name: string; subIndustries: { id: string; name: string }[] };

export const getIndustryTree = cache(async (): Promise<IndustryTreeRow[]> => {
  return prisma.industry.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      subIndustries: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });
});

export type IndustryOptionGroup = { name: string; selectable: boolean; subIndustries: { name: string }[] };

/** Resolves a form's "Industry Served" dropdown as a tree — only industries/sub-industries the
 * admin explicitly picked, grouped under their parent for display. Empty `industryIds` means
 * nothing is picked yet, so no options show. A parent whose only picked descendant is a
 * sub-industry still appears as a (non-selectable) group heading so the sub reads in context. */
export async function getIndustryOptionsForForm(formKey: FormKey): Promise<IndustryOptionGroup[]> {
  const [config, tree] = await Promise.all([getFormConfig(), getIndustryTree()]);
  const industryIds = config[formKey]?.industryIds ?? [];

  if (industryIds.length === 0) return [];

  const selected = new Set(industryIds);
  const groups: IndustryOptionGroup[] = [];

  for (const industry of tree) {
    const selectable = selected.has(industry.id);
    const subIndustries = industry.subIndustries.filter((s) => selected.has(s.id)).map((s) => ({ name: s.name }));
    if (selectable || subIndustries.length > 0) {
      groups.push({ name: industry.name, selectable, subIndustries });
    }
  }
  return groups;
}
