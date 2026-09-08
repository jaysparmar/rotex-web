"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DownloadCard } from "@/components/ui/download-card";
import { DownloadsFilterField } from "@/components/ui/downloads-filter-field";
import { MobileDownloadsFilters } from "@/components/ui/mobile-downloads-filters";
import { Pagination } from "@/components/ui/pagination";
import { DOWNLOAD_TABS, type DownloadTab, type DownloadItem } from "@/lib/downloads-data";

const ALL = "All";
const ALL_TAB = "all" as const;
const PAGE_SIZE = 9;

type PublicTab = DownloadTab | typeof ALL_TAB;

const PUBLIC_TABS: { id: PublicTab; label: string }[] = [{ id: ALL_TAB, label: "All" }, ...DOWNLOAD_TABS];

function uniqueOptions(items: DownloadItem[], key: keyof DownloadItem): string[] {
  return Array.from(new Set(items.map((i) => String(i[key])).filter(Boolean)));
}

export function DownloadsSection({ items }: { items: DownloadItem[] }) {
  const [activeTab, setActiveTab] = useState<PublicTab>(ALL_TAB);
  const [product, setProduct] = useState(ALL);
  const [subCategory, setSubCategory] = useState(ALL);
  const [productCert, setProductCert] = useState(ALL);
  const [qmsCert, setQmsCert] = useState(ALL);
  const [industry, setIndustry] = useState(ALL);
  const [page, setPage] = useState(1);

  const productOptions = useMemo(() => uniqueOptions(items, "product"), [items]);
  const subCategoryOptions = useMemo(() => uniqueOptions(items, "subCategory"), [items]);
  const productCertOptions = useMemo(() => uniqueOptions(items, "productCertificateType"), [items]);
  const qmsCertOptions = useMemo(() => uniqueOptions(items, "qmsCertificateType"), [items]);
  const industryOptions = useMemo(() => uniqueOptions(items, "industry"), [items]);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (activeTab === ALL_TAB || item.tab === activeTab) &&
          (product === ALL || item.product === product) &&
          (subCategory === ALL || item.subCategory === subCategory) &&
          (productCert === ALL || item.productCertificateType === productCert) &&
          (qmsCert === ALL || item.qmsCertificateType === qmsCert) &&
          (industry === ALL || item.industry === industry)
      ),
    [items, activeTab, product, subCategory, productCert, qmsCert, industry]
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeTab = (tab: PublicTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const hasActiveFilters =
    product !== ALL || subCategory !== ALL || productCert !== ALL || qmsCert !== ALL || industry !== ALL;

  const clearFilters = () => {
    setProduct(ALL);
    setSubCategory(ALL);
    setProductCert(ALL);
    setQmsCert(ALL);
    setIndustry(ALL);
    setPage(1);
  };

  return (
    <section className="py-16 lg:py-20">
      <div className="container flex flex-col lg:flex-row gap-10">
        {/* Mobile filters */}
        <MobileDownloadsFilters
          productOptions={productOptions}
          subCategoryOptions={subCategoryOptions}
          productCertOptions={productCertOptions}
          qmsCertOptions={qmsCertOptions}
          industryOptions={industryOptions}
          product={product}
          setProduct={setProduct}
          subCategory={subCategory}
          setSubCategory={setSubCategory}
          productCert={productCert}
          setProductCert={setProductCert}
          qmsCert={qmsCert}
          setQmsCert={setQmsCert}
          industry={industry}
          setIndustry={setIndustry}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:flex w-full lg:w-80 shrink-0 flex-col gap-7">
          <div className="flex items-center justify-between">
            <h2 className="text-stone-900 text-base font-semibold font-montserrat leading-6">Filters</h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[#EF3E23] text-xs font-semibold font-montserrat leading-5 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
          <DownloadsFilterField label="Product" placeholder="Select Product" options={productOptions} value={product} onChange={setProduct} />
          <DownloadsFilterField
            label="Sub Category Product"
            placeholder="Select Sub Category Product"
            options={subCategoryOptions}
            value={subCategory}
            onChange={setSubCategory}
          />
          <DownloadsFilterField
            label="Product Certificate type"
            placeholder="Select Product Certificate Type"
            options={productCertOptions}
            value={productCert}
            onChange={setProductCert}
          />
          <DownloadsFilterField
            label="Quality Management Certificate type"
            placeholder="Select Quality Management Certificate Type"
            options={qmsCertOptions}
            value={qmsCert}
            onChange={setQmsCert}
          />
          <DownloadsFilterField label="Industry Type" placeholder="Select Industry Type" options={industryOptions} value={industry} onChange={setIndustry} />
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="border-b border-stone-300 flex items-center gap-5 overflow-x-auto">
            {PUBLIC_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={cn(
                  "px-2.5 py-5 border-b-2 whitespace-nowrap text-sm font-medium font-montserrat leading-5 transition-colors",
                  tab.id === activeTab ? "border-[#EF3E23] text-[#EF3E23]" : "border-transparent text-stone-900 hover:text-[#EF3E23]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${page}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="lg:min-h-171"
            >
              {visibleItems.length > 0 ? (
                <div className="py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleItems.map((item) => (
                    <DownloadCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 text-center py-20">No downloads in this category.</p>
              )}
            </motion.div>
          </AnimatePresence>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </section>
  );
}
