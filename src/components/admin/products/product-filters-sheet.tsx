"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SelectField, FieldGrid } from "@/components/admin/form-fields";
import { PRODUCT_ATTRIBUTES, PRODUCT_FAMILIES } from "@/lib/product-constants";
import { FILTER_KEYS, type ProductFilterParams } from "@/lib/product-filters";
import type { getCompanyCategoryTree, getIndustryTree } from "@/lib/products";

const NONE = "__none__";

type CompanyOption = Awaited<ReturnType<typeof getCompanyCategoryTree>>[number];
type IndustryOption = Awaited<ReturnType<typeof getIndustryTree>>[number];

function filtersKey(f: ProductFilterParams) {
  return FILTER_KEYS.map((k) => f[k] ?? "").join("|");
}

export function ProductFiltersSheet({
  open,
  onOpenChange,
  filters,
  companies,
  industries,
  attributeValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProductFilterParams;
  companies: CompanyOption[];
  industries: IndustryOption[];
  attributeValues: Record<string, string[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pending, setPending] = useState<ProductFilterParams>(filters);
  const [prevKey, setPrevKey] = useState(filtersKey(filters));
  const [prevOpen, setPrevOpen] = useState(open);

  if (filtersKey(filters) !== prevKey) {
    setPrevKey(filtersKey(filters));
    setPending(filters);
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setPending(filters);
  }

  function set<K extends keyof ProductFilterParams>(key: K, value: string) {
    setPending((p) => {
      const next = { ...p, [key]: value === NONE || !value ? undefined : value };
      if (key === "companyId") {
        next.categoryId = undefined;
        next.subCategoryId = undefined;
      }
      if (key === "categoryId") next.subCategoryId = undefined;
      if (key === "industryId") next.subIndustryId = undefined;
      return next;
    });
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams);
    if (pending.q) params.set("q", pending.q);
    for (const key of FILTER_KEYS) {
      const value = pending[key];
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    onOpenChange(false);
  }

  function resetFilters() {
    const params = new URLSearchParams(searchParams);
    for (const key of FILTER_KEYS) params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    onOpenChange(false);
  }

  const selectedCompany = companies.find((c) => c.id === pending.companyId);
  const categoryOptions = (selectedCompany?.categories ?? []).map((c) => ({ value: c.id, label: c.name }));
  const selectedCategory = selectedCompany?.categories.find((c) => c.id === pending.categoryId);
  const subCategoryOptions = [
    { value: NONE, label: "— Any —" },
    ...(selectedCategory?.subCategories ?? []).map((s) => ({ value: s.id, label: s.name })),
  ];

  const selectedIndustry = industries.find((i) => i.id === pending.industryId);
  const subIndustryOptions = [
    { value: NONE, label: "— Any —" },
    ...(selectedIndustry?.subIndustries ?? []).map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
          <SheetDescription>Pick Variable or Simple first to see the relevant filters.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Product Type
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={pending.productType === "variable" ? "secondary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => set("productType", "variable")}
              >
                Variable
              </Button>
              <Button
                type="button"
                variant={pending.productType === "simple" ? "secondary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => set("productType", "simple")}
              >
                Simple
              </Button>
            </div>
          </div>

          {pending.productType && (
            <>
              <FieldGrid>
                <SelectField
                  label="Company"
                  options={[{ value: NONE, label: "— Any —" }, ...companies.map((c) => ({ value: c.id, label: c.name }))]}
                  value={pending.companyId ?? NONE}
                  onChange={(e) => set("companyId", e.target.value)}
                />
                <SelectField
                  label="Category"
                  options={[{ value: NONE, label: "— Any —" }, ...categoryOptions]}
                  value={pending.categoryId ?? NONE}
                  onChange={(e) => set("categoryId", e.target.value)}
                />
              </FieldGrid>
              <SelectField
                label="Sub-Category"
                options={subCategoryOptions}
                value={pending.subCategoryId ?? NONE}
                onChange={(e) => set("subCategoryId", e.target.value)}
              />
              <SelectField
                label="Product Family"
                options={[{ value: NONE, label: "— Any —" }, ...PRODUCT_FAMILIES.map((f) => ({ value: f, label: f }))]}
                value={pending.productFamily ?? NONE}
                onChange={(e) => set("productFamily", e.target.value)}
              />
              <FieldGrid>
                <SelectField
                  label="Industry"
                  options={[{ value: NONE, label: "— Any —" }, ...industries.map((i) => ({ value: i.id, label: i.name }))]}
                  value={pending.industryId ?? NONE}
                  onChange={(e) => set("industryId", e.target.value)}
                />
                <SelectField
                  label="Sub-Industry"
                  options={subIndustryOptions}
                  value={pending.subIndustryId ?? NONE}
                  onChange={(e) => set("subIndustryId", e.target.value)}
                />
              </FieldGrid>

              {pending.productType === "variable" && (
                <FieldGrid>
                  {PRODUCT_ATTRIBUTES.map((attr) => (
                    <SelectField
                      key={attr.key}
                      label={attr.label}
                      options={[
                        { value: NONE, label: "— Any —" },
                        ...(attributeValues[attr.key] ?? []).map((v) => ({ value: v, label: v })),
                      ]}
                      value={pending[attr.key] ?? NONE}
                      onChange={(e) => set(attr.key, e.target.value)}
                    />
                  ))}
                </FieldGrid>
              )}
            </>
          )}
        </div>

        <SheetFooter className="flex-row justify-between">
          <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
          <Button type="button" size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
