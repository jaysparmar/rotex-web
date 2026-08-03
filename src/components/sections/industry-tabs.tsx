"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

type TabItem = { slug: string; name: string };

type Props = {
  sectorSlug: string;
  subIndustries: TabItem[];
};

export function IndustryTabs({ sectorSlug, subIndustries }: Props) {
  const pathname = usePathname();

  // /industries/<sector>/<sub>? — the sub segment is absent on the main sector page.
  const subSlug = pathname.split("/").filter(Boolean)[2];
  // With no sub in the URL the first tab still reads as selected, since the
  // sector page renders that sub-sector's content.
  const activeSlug = subSlug ?? subIndustries[0]?.slug;

  useEffect(() => {
    // Arriving at the bare sector page starts at the top of the hero. Next.js
    // preserves scroll position across the shared (site) layout, so a click from
    // halfway down the home page would otherwise land mid-page.
    if (!subSlug) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    // The URL names a sub-sector — jump to its content instead.
    document.getElementById("industry-sub-content")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [subSlug]);

  return (
    <div className="sticky top-20 lg:top-24 z-20 bg-white shadow-[0px_2px_4px_0px_rgba(31,31,31,0.05)]">
      <div className="container">
        {/* Mobile: spread across the full width like the Resources tabs.
            Desktop: left-aligned, scrolling if the sector has many sub-industries. */}
        <div className="flex items-end justify-between lg:justify-start gap-0.5 lg:gap-1 overflow-x-auto no-scrollbar border-b border-stone-200">
          {subIndustries.map((sub) => {
            const isActive = sub.slug === activeSlug;
            return (
              <Link
                key={sub.slug}
                href={`/industries/${sectorSlug}/${sub.slug}`}
                scroll={false}
                className={`shrink-0 p-2.5 lg:px-2.5 lg:py-6 border-b-2 -mb-px text-sm lg:text-lg font-semibold font-montserrat leading-5 lg:leading-6 whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-stone-900 hover:text-red-600"
                }`}
              >
                {sub.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
