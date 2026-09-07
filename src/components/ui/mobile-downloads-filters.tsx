"use client";

import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const ALL = "All";

type FilterCategory = "product" | "subCategory" | "productCert" | "qmsCert" | "industry";

type CategoryConfig = {
  id: FilterCategory;
  rowLabel: string;
  panelTitle: string;
  allLabel: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

export function MobileDownloadsFilters({
  productOptions,
  subCategoryOptions,
  productCertOptions,
  qmsCertOptions,
  industryOptions,
  product,
  setProduct,
  subCategory,
  setSubCategory,
  productCert,
  setProductCert,
  qmsCert,
  setQmsCert,
  industry,
  setIndustry,
  hasActiveFilters,
  clearFilters,
}: {
  productOptions: string[];
  subCategoryOptions: string[];
  productCertOptions: string[];
  qmsCertOptions: string[];
  industryOptions: string[];
  product: string;
  setProduct: (v: string) => void;
  subCategory: string;
  setSubCategory: (v: string) => void;
  productCert: string;
  setProductCert: (v: string) => void;
  qmsCert: string;
  setQmsCert: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [panel, setPanel] = useState<FilterCategory | null>(null);

  const categories: CategoryConfig[] = [
    {
      id: "product",
      rowLabel: "Product",
      panelTitle: "Select Product",
      allLabel: "All Products",
      placeholder: "Select Product",
      options: productOptions,
      value: product,
      onChange: setProduct,
    },
    {
      id: "subCategory",
      rowLabel: "Sub Category Product",
      panelTitle: "Select Sub Category Product",
      allLabel: "All Sub Categories",
      placeholder: "Select Sub Category Product",
      options: subCategoryOptions,
      value: subCategory,
      onChange: setSubCategory,
    },
    {
      id: "productCert",
      rowLabel: "Product Certificate type",
      panelTitle: "Select Product Certificate",
      allLabel: "All Certificates",
      placeholder: "Select Certificate",
      options: productCertOptions,
      value: productCert,
      onChange: setProductCert,
    },
    {
      id: "qmsCert",
      rowLabel: "Quality Management Certificate type",
      panelTitle: "Select Quality Management Certificate",
      allLabel: "All Certificates",
      placeholder: "Select Certificate",
      options: qmsCertOptions,
      value: qmsCert,
      onChange: setQmsCert,
    },
    {
      id: "industry",
      rowLabel: "Industry Type",
      panelTitle: "Select Industry",
      allLabel: "All Industries",
      placeholder: "Select Industry",
      options: industryOptions,
      value: industry,
      onChange: setIndustry,
    },
  ];

  const activePanel = categories.find((c) => c.id === panel) ?? null;

  function selectValue(cat: CategoryConfig, v: string) {
    cat.onChange(v);
    setPanel(null);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="w-full px-2 py-3 bg-neutral-100 rounded-sm flex justify-center items-center gap-2.5 text-stone-900 text-sm font-semibold font-montserrat leading-6"
      >
        Filters{hasActiveFilters ? " •" : ""}
      </button>

      {/* Main filters bottom sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          <SheetHeader className="flex-row items-center justify-between pr-9">
            <SheetTitle>Filters</SheetTitle>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-red-600 text-xs font-semibold font-montserrat hover:underline"
              >
                Clear Filters
              </button>
            )}
          </SheetHeader>
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto px-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col gap-2">
                <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase leading-5">
                  {cat.rowLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setPanel(cat.id)}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline-1 -outline-offset-1 outline-gray-200 text-left text-sm font-medium font-montserrat"
                >
                  <span className={cat.value === ALL ? "text-neutral-400" : "text-stone-900"}>
                    {cat.value === ALL ? cat.placeholder : cat.value}
                  </span>
                </button>
              </div>
            ))}
          </div>
          <SheetFooter>
            <Button type="button" onClick={() => setFiltersOpen(false)}>
              Show Results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Per-field value picker bottom sheet, stacked above the filters sheet */}
      <Sheet open={activePanel !== null} onOpenChange={(next) => !next && setPanel(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          {activePanel && (
            <>
              <SheetHeader className="flex-row items-center gap-2 pr-9">
                <button type="button" onClick={() => setPanel(null)} className="text-red-600">
                  <ChevronLeft className="size-4" />
                </button>
                <SheetTitle className="text-red-600">{activePanel.panelTitle}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <button
                  type="button"
                  onClick={() => selectValue(activePanel, ALL)}
                  className="flex w-full items-center justify-between gap-3 border-b border-stone-100 py-3 text-left text-sm font-montserrat text-stone-900"
                >
                  {activePanel.allLabel}
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                      activePanel.value === ALL ? "border-red-600 bg-red-600" : "border-stone-300"
                    }`}
                  >
                    {activePanel.value === ALL && <Check className="size-3 text-white" />}
                  </span>
                </button>
                {activePanel.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => selectValue(activePanel, opt)}
                    className="flex w-full items-center justify-between gap-3 border-b border-stone-100 py-3 text-left text-sm font-montserrat text-stone-900"
                  >
                    {opt}
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                        activePanel.value === opt ? "border-red-600 bg-red-600" : "border-stone-300"
                      }`}
                    >
                      {activePanel.value === opt && <Check className="size-3 text-white" />}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
