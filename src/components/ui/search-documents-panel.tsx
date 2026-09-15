"use client";

import { DownloadCard } from "@/components/ui/download-card";
import { DownloadsFilterField } from "@/components/ui/downloads-filter-field";
import { MobileDownloadsFilters, type FilterCategoryConfig } from "@/components/ui/mobile-downloads-filters";
import { Pagination } from "@/components/ui/pagination";
import type { DownloadItem } from "@/lib/downloads-data";
import type { DocumentFilterOptions } from "@/lib/search-data";

const ALL = "All";

export function SearchDocumentsPanel({
  items,
  total,
  filterOptions,
  page,
  pageSize,
  onPageChange,
  filters,
  onFiltersChange,
}: {
  items: DownloadItem[];
  total: number;
  filterOptions: DocumentFilterOptions;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  filters: { product: string; productCertificateType: string; qualityCertificateType: string; industry: string };
  onFiltersChange: (next: typeof filters) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const set = (key: keyof typeof filters) => (value: string) =>
    onFiltersChange({ ...filters, [key]: value === ALL ? "" : value });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const clearFilters = () => {
    onFiltersChange({ product: "", productCertificateType: "", qualityCertificateType: "", industry: "" });
  };

  const categories: FilterCategoryConfig[] = [
    {
      id: "product",
      rowLabel: "Product",
      panelTitle: "Select Product",
      allLabel: "All Products",
      placeholder: "Select Product",
      options: filterOptions.products,
      value: filters.product || ALL,
      onChange: set("product"),
    },
    {
      id: "productCertificateType",
      rowLabel: "Product Certificate Type",
      panelTitle: "Select Product Certificate Type",
      allLabel: "All Types",
      placeholder: "Product Certificate Type",
      options: filterOptions.productCertificateTypes,
      value: filters.productCertificateType || ALL,
      onChange: set("productCertificateType"),
    },
    {
      id: "qualityCertificateType",
      rowLabel: "Quality Certificate Type",
      panelTitle: "Select Quality Certificate Type",
      allLabel: "All Types",
      placeholder: "Quality Certificate Type",
      options: filterOptions.qualityCertificateTypes,
      value: filters.qualityCertificateType || ALL,
      onChange: set("qualityCertificateType"),
    },
    {
      id: "industry",
      rowLabel: "Industry",
      panelTitle: "Select Industry",
      allLabel: "All Industries",
      placeholder: "Industry",
      options: filterOptions.industries,
      value: filters.industry || ALL,
      onChange: set("industry"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="hidden lg:flex flex-wrap items-center gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="w-56">
            <DownloadsFilterField label={cat.rowLabel} placeholder={cat.placeholder} options={cat.options} value={cat.value} onChange={cat.onChange} />
          </div>
        ))}
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="text-[#EF3E23] text-xs font-semibold font-montserrat hover:underline">
            Clear All Filters
          </button>
        )}
      </div>

      <MobileDownloadsFilters categories={categories} hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} />

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <DownloadCard key={item.id} item={item} showCategoryTag />
          ))}
        </div>
      ) : (
        <p className="text-stone-400 text-center py-20">No documents match your search.</p>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}
