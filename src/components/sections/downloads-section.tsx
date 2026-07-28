"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DownloadCard } from "@/components/ui/download-card";
import { DownloadsFilterField } from "@/components/ui/downloads-filter-field";
import { Pagination } from "@/components/ui/pagination";
import {
  DOWNLOAD_ITEMS,
  DOWNLOAD_TABS,
  PRODUCT_OPTIONS,
  SUB_CATEGORY_OPTIONS,
  PRODUCT_CERTIFICATE_OPTIONS,
  QMS_CERTIFICATE_OPTIONS,
  INDUSTRY_OPTIONS,
  type DownloadTab,
} from "@/lib/downloads-data";

const ALL = "All";
const PAGE_SIZE = 9;

export function DownloadsSection() {
  const [activeTab, setActiveTab] = useState<DownloadTab>("certificates");
  const [product, setProduct] = useState(ALL);
  const [subCategory, setSubCategory] = useState(ALL);
  const [productCert, setProductCert] = useState(ALL);
  const [qmsCert, setQmsCert] = useState(ALL);
  const [industry, setIndustry] = useState(ALL);
  const [page, setPage] = useState(1);

  const items = useMemo(() => DOWNLOAD_ITEMS.filter((item) => item.tab === activeTab), [activeTab]);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visibleItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeTab = (tab: DownloadTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <section className="py-16 lg:py-20">
      <div className="container flex flex-col lg:flex-row gap-10">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-7">
          <h2 className="text-stone-900 text-base font-semibold font-montserrat leading-6">Filters</h2>
          <DownloadsFilterField label="Product" placeholder="Select Product" options={PRODUCT_OPTIONS} value={product} onChange={setProduct} />
          <DownloadsFilterField
            label="Sub Category Product"
            placeholder="Select Sub Category Product"
            options={SUB_CATEGORY_OPTIONS}
            value={subCategory}
            onChange={setSubCategory}
          />
          <DownloadsFilterField
            label="Product Certificate type"
            placeholder="Select Certificate"
            options={PRODUCT_CERTIFICATE_OPTIONS}
            value={productCert}
            onChange={setProductCert}
          />
          <DownloadsFilterField
            label="Quality Management Certificate type"
            placeholder="Select Certificate"
            options={QMS_CERTIFICATE_OPTIONS}
            value={qmsCert}
            onChange={setQmsCert}
          />
          <DownloadsFilterField label="Industry Type" placeholder="Select Industry" options={INDUSTRY_OPTIONS} value={industry} onChange={setIndustry} />
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="border-b border-stone-300 flex items-center gap-5 overflow-x-auto">
            {DOWNLOAD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={cn(
                  "px-2.5 py-5 border-b-2 whitespace-nowrap text-sm font-medium font-montserrat leading-5 transition-colors",
                  tab.id === activeTab ? "border-red-600 text-red-600" : "border-transparent text-stone-900 hover:text-red-600"
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
              className="min-h-171"
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
