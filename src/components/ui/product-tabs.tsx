"use client";

import { useMemo, useState } from "react";
import { IoDownloadOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import type { SpecItem, DownloadItem } from "@/lib/product-detail-data";

const TABS = ["Features", "Specifications", "Downloads"] as const;
type Tab = (typeof TABS)[number];

export function ProductTabs({
  features,
  specifications,
  downloads,
}: {
  features: string;
  specifications: SpecItem[];
  downloads: DownloadItem[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Downloads");
  const [category, setCategory] = useState("All Documents");

  const categories = useMemo(() => ["All Documents", ...Array.from(new Set(downloads.map((d) => d.category)))], [
    downloads,
  ]);

  const visibleDownloads =
    category === "All Documents" ? downloads : downloads.filter((d) => d.category === category);

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="border-b border-stone-300 flex items-start gap-5">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-2.5 py-5 border-b-2 -mb-px text-base font-semibold font-montserrat leading-6 transition-colors",
              activeTab === tab ? "border-red-600 text-red-600" : "border-transparent text-stone-900 hover:text-red-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Features" && (
        <p className="text-stone-600 text-sm font-medium font-montserrat leading-6">{features}</p>
      )}

      {activeTab === "Specifications" && (
        <div className="flex flex-col gap-px rounded-lg overflow-hidden border border-neutral-200">
          {specifications.map((spec) => (
            <div key={spec.key} className="flex justify-between gap-4 px-6 py-3 bg-white odd:bg-stone-50">
              <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase">{spec.key}</span>
              <span className="text-zinc-800 text-sm font-medium font-montserrat">{spec.value}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Downloads" && (
        <div className="flex flex-col gap-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-80 h-11 px-5 py-2.5 rounded-full outline outline-1 -outline-offset-1 outline-neutral-200 text-black text-sm font-medium font-montserrat"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex flex-col gap-5">
            {visibleDownloads.map((d, i) => (
              <div
                key={i}
                className="px-6 py-3 bg-white rounded-[10px] outline outline-1 -outline-offset-1 outline-neutral-200 flex justify-between items-start gap-4"
              >
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase">
                    {d.category}
                  </span>
                  <span className="text-zinc-800 text-base font-medium font-montserrat">{d.title}</span>
                </div>
                <a
                  href={d.url}
                  className="px-5 py-2 bg-stone-100 rounded-full flex items-center gap-2.5 shrink-0 hover:bg-stone-200 transition-colors"
                >
                  <IoDownloadOutline className="text-red-600" size={18} />
                  <span className="text-red-600 text-sm font-semibold font-montserrat">Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
