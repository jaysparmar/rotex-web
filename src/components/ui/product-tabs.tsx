"use client";

import { useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { IoEyeOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { toRichHtml } from "@/lib/rich-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DownloadIcon } from "@/components/ui/download-icon";
import type { SpecItem, DownloadItem } from "@/lib/product-detail-data";
import richContentStyles from "@/components/sections/rich-content.module.css";

const TABS = ["Features", "Specifications", "Certificates", "Downloads"] as const;
type Tab = (typeof TABS)[number];

export function ProductTabs({
  features,
  specifications,
  downloads,
  certificates = [],
}: {
  features: string;
  specifications: SpecItem[];
  downloads: DownloadItem[];
  certificates?: string[];
}) {
  const visibleTabs = useMemo(
    () =>
      TABS.filter((tab) => {
        if (tab === "Features") return features.trim().length > 0;
        if (tab === "Specifications") return specifications.length > 0;
        if (tab === "Certificates") return certificates.length > 0;
        return downloads.length > 0;
      }),
    [features, specifications, downloads, certificates]
  );

  const [requestedTab, setRequestedTab] = useState<Tab | undefined>(visibleTabs[0]);
  const activeTab = requestedTab && visibleTabs.includes(requestedTab) ? requestedTab : visibleTabs[0];
  const [category, setCategory] = useState("All Documents");

  const categories = useMemo(() => ["All Documents", ...Array.from(new Set(downloads.map((d) => d.category)))], [
    downloads,
  ]);

  const visibleDownloads =
    category === "All Documents" ? downloads : downloads.filter((d) => d.category === category);

  const featuresHtml = useMemo(
    () => (features.trim() ? DOMPurify.sanitize(toRichHtml(features)) : ""),
    [features]
  );

  if (visibleTabs.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="no-scrollbar border-b border-stone-300 flex items-start gap-5 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setRequestedTab(tab)}
            className={cn(
              "shrink-0 whitespace-nowrap px-2.5 py-5 border-b-2 -mb-px text-base sm:text-lg font-semibold font-montserrat leading-6 transition-colors",
              activeTab === tab ? "border-[#EF3E23] text-[#EF3E23]" : "border-transparent text-stone-900 hover:text-[#EF3E23]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Features" && (
        <div
          className={cn(
            "max-w-170 text-stone-900 text-sm font-medium font-montserrat leading-5",
            richContentStyles.content
          )}
          dangerouslySetInnerHTML={{ __html: featuresHtml }}
        />
      )}

      {activeTab === "Specifications" && (
        <div className="max-h-137.5 flex flex-col overflow-y-auto">
          {specifications.map((spec, i) => (
            <div
              key={`${spec.key}-${i}`}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-14 py-3.5 border-t border-neutral-200 last:border-b"
            >
              <span className="sm:w-48 shrink-0 text-stone-900 text-sm font-semibold font-montserrat leading-5">
                {spec.key}
              </span>
              <span className="flex-1 text-stone-900 text-sm font-medium font-montserrat leading-5">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Certificates" && (
        <div className="flex flex-wrap items-center gap-2.5">
          {certificates.map((cert) => (
            <span
              key={cert}
              className="px-4 py-0.5 bg-zinc-100 rounded-full text-stone-900 text-xs font-medium font-montserrat uppercase"
            >
              {cert}
            </span>
          ))}
        </div>
      )}

      {activeTab === "Downloads" && (
        <div className="flex flex-col gap-6">
          <Select
            items={categories.map((c) => ({ value: c, label: c }))}
            value={category}
            onValueChange={(v) => setCategory(v ?? "All Documents")}
          >
            <SelectTrigger className="w-80 h-11 px-5 py-2.5 rounded-full border-0 outline outline-1 -outline-offset-1 outline-neutral-200 text-black text-sm font-medium font-montserrat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-5">
            {visibleDownloads.map((d, i) => (
              <div
                key={i}
                className="px-6 py-3 bg-white rounded-[10px] outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4"
              >
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase">
                    {d.category}
                  </span>
                  <span className="text-zinc-800 text-base font-medium font-montserrat">{d.title}</span>
                </div>
                <div className="self-start flex items-center gap-2 shrink-0">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View document"
                    title="View"
                    className="p-2 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors"
                  >
                    <IoEyeOutline className="text-stone-600" size={20} />
                  </a>
                  <a
                    href={d.url}
                    download
                    className="px-5 py-2 bg-stone-100 rounded-full flex items-center gap-2.5 hover:bg-stone-200 transition-colors"
                  >
                    <DownloadIcon className="text-[#EF3E23]" size={20} />
                    <span className="text-[#EF3E23] text-sm font-semibold font-montserrat">Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
