"use client";

import { useEffect, useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { IoEyeOutline, IoChevronDownOutline, IoRemoveOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { toRichHtml } from "@/lib/rich-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DownloadIcon } from "@/components/ui/download-icon";
import type { SpecItem, DownloadItem } from "@/lib/product-detail-data";
import richContentStyles from "@/components/sections/rich-content.module.css";

const SECTIONS = ["Features", "Specifications", "Certificates", "Downloads"] as const;
type Section = (typeof SECTIONS)[number];

function TabRow({ sections, active, onSelect }: { sections: Section[]; active: Section; onSelect: (s: Section) => void }) {
  return (
    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar border-b border-neutral-200">
      {sections.map((section) => {
        const isActive = section === active;
        return (
          <button
            key={section}
            type="button"
            onClick={() => onSelect(section)}
            className={cn(
              "shrink-0 whitespace-nowrap pb-3 border-b-2 -mb-px text-base font-semibold font-montserrat leading-6 transition-colors",
              isActive
                ? "border-[#EF3E23] text-[#EF3E23]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            )}
          >
            {section}
          </button>
        );
      })}
    </div>
  );
}

function AccordionHeader({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={cn(
        "w-full flex justify-between items-center py-5 border-b-2 transition-colors",
        open ? "border-[#EF3E23] text-[#EF3E23]" : "border-neutral-200 text-stone-900 hover:text-[#EF3E23]"
      )}
    >
      <span className="text-base font-semibold font-montserrat leading-6">{label}</span>
      {open ? <IoRemoveOutline size={20} /> : <IoChevronDownOutline size={20} />}
    </button>
  );
}

function FeaturesPanel({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "max-w-170 text-stone-900 text-sm font-medium font-montserrat leading-5",
          !expanded && "line-clamp-8",
          richContentStyles.content
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-fit text-left text-neutral-400 text-sm font-medium font-montserrat leading-6 hover:text-stone-600 transition-colors"
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </div>
  );
}

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
  const visibleSections = useMemo(
    () =>
      SECTIONS.filter((section) => {
        if (section === "Features") return features.trim().length > 0;
        if (section === "Specifications") return specifications.length > 0;
        if (section === "Certificates") return certificates.length > 0;
        return downloads.length > 0;
      }),
    [features, specifications, downloads, certificates]
  );

  // Desktop: single active tab. Mobile: independently toggled accordion —
  // separate state since "one open" and "any combination open" don't map
  // onto each other.
  const [active, setActive] = useState<Section | null>(null);
  const activeSection = active && visibleSections.includes(active) ? active : visibleSections[0];

  const [openSections, setOpenSections] = useState<Set<Section> | null>(null);
  const open = openSections ?? new Set(visibleSections);
  const toggleOpen = (section: Section) => {
    setOpenSections((prev) => {
      const next = new Set(prev ?? visibleSections);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // If the active tab's content disappears (e.g. switching variants drops
  // Certificates), fall back to the first still-visible tab.
  useEffect(() => {
    if (active && !visibleSections.includes(active)) setActive(null);
  }, [active, visibleSections]);

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

  if (visibleSections.length === 0) return null;

  function renderContent(section: Section) {
    switch (section) {
      case "Features":
        return <FeaturesPanel html={featuresHtml} />;

      case "Specifications":
        return (
          <div className="max-h-137.5 flex flex-col overflow-y-auto">
            {specifications.map((spec, i) => (
              <div
                key={`${spec.key}-${i}`}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-14 py-3.5 border-t border-neutral-200 first:border-t-0 last:border-b"
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
        );

      case "Certificates":
        return (
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
        );

      case "Downloads":
        return (
          <div className="flex flex-col gap-6">
            <Select
              items={categories.map((c) => ({ value: c, label: c }))}
              value={category}
              onValueChange={(v) => setCategory(v ?? "All Documents")}
            >
              <SelectTrigger className="w-full sm:w-80 h-11 px-5 py-2.5 rounded-full border-0 outline outline-1 -outline-offset-1 outline-neutral-200 text-black text-sm font-medium font-montserrat">
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
        );
    }
  }

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: accordion — every section stacked, each independently toggled */}
      <div className="lg:hidden flex flex-col">
        {visibleSections.map((section) => {
          const isOpen = open.has(section);
          return (
            <div key={section} className="flex flex-col">
              <AccordionHeader label={section} open={isOpen} onClick={() => toggleOpen(section)} />
              {isOpen && <div className="py-5">{renderContent(section)}</div>}
            </div>
          );
        })}
      </div>

      {/* Desktop: single-active tab row */}
      <div className="hidden lg:flex lg:flex-col">
        <TabRow sections={visibleSections} active={activeSection} onSelect={setActive} />
        <div className="py-5">{renderContent(activeSection)}</div>
      </div>
    </div>
  );
}
