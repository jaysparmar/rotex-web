"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AwardCard, type AwardCardProps } from "@/components/ui/award-card";
import { AwardsHeroSection } from "@/components/sections/awards-hero-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Dummy data ────────────────────────────────────────────────────────────────

const ALL_AWARDS: AwardCardProps[] = [
  {
    slug: "rail-analysis-innovation-100-2025",
    year: "2025",
    title: "Rail Analysis Innovation-100 (2025 Edition)",
    description: 'Featured as one of the "100 Innovative Companies in the Rail Sector of India".',
  },
  {
    slug: "2nd-best-display-of-products-award-2025",
    year: "2025",
    title: "2nd Best Display of Products Award",
    description:
      "Retex wins the 2nd Prize for Best Product Display at Dahej Industrial Expo 2025 for the second consecutive year.",
  },
  {
    slug: "zed-bronze-certificate-unit-2-2025",
    year: "2025",
    title: "Bronze Certificate (Unit-II)",
    description: "Quality and compliance recognition for the manufacturing unit.",
  },
  {
    slug: "1st-runner-up-isq-tops-convention-2025",
    year: "2025",
    title: "1st Runner-Up at ISQ TOPS Convention 2025",
    description:
      '1st Runner-Up at the National-Level Indian Society for Quality (ISQ) Competition for the "Aarambh" Case Study.',
  },
  {
    slug: "leaders-of-tomorrow-awards-season-11-2024",
    year: "2024",
    title: "Leaders of Tomorrow Awards (Season 11)",
    description: "Winner in the Automobiles & OEM Category for exceptional contributions to the SME sector.",
  },
  {
    slug: "2nd-best-display-of-products-award-2024",
    year: "2024",
    title: "2nd Best Display of Products Award",
    description: "Recognition for innovation and quality in showcasing engineering solutions at the Dahej Industrial Expo 2024.",
  },
  {
    slug: "cii-design-excellence-award-2022",
    year: "2022",
    title: "CII Design Excellence Award 2022",
    description: 'Sub-category winner for "Automobile Accessory Design" under Mobility Design for the Rotex Tyre Inflation System (RTIS).',
  },
];

const PAGE_SIZE = 6;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AwardsPage() {
  const years = useMemo(
    () => Array.from(new Set(ALL_AWARDS.map((a) => a.year))).sort((a, b) => Number(b) - Number(a)),
    []
  );

  const [yearFilter, setYearFilter] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredAwards = yearFilter
    ? ALL_AWARDS.filter((a) => a.year === yearFilter)
    : ALL_AWARDS;

  const visibleAwards = filteredAwards.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAwards.length;

  return (
    <div>
      <AwardsHeroSection />

      {/* Breadcrumb */}
      <div className="container pt-5">
        <nav className="flex items-center gap-4" aria-label="Breadcrumb">
          <Link href="/" className="text-stone-500 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide hover:text-stone-700 transition-colors">
            Home
          </Link>
          <span className="text-stone-500 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide">/</span>
          <Link href="/about" className="text-stone-500 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide hover:text-stone-700 transition-colors">
            About us
          </Link>
          <span className="text-stone-500 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide">/</span>
          <span className="text-red-600 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide">Awards &amp; Recognition</span>
        </nav>
      </div>

      <div className="container py-12 flex flex-col gap-8">
        {/* Filter bar */}
        <div className="flex justify-end items-center gap-5">
          <span className="text-black text-base font-medium font-montserrat leading-6">Filter by:</span>
          <Select
            value={yearFilter || "All Years"}
            onValueChange={(v) => {
              setYearFilter(v === "All Years" ? "" : (v ?? ""));
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <SelectTrigger className="w-auto h-11 px-5 py-2.5 bg-zinc-100 rounded-xl border-0 gap-5 text-stone-900 text-base font-medium font-montserrat">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Years">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {visibleAwards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleAwards.map((award) => (
              <AwardCard key={award.slug} {...award} />
            ))}
          </div>
        ) : (
          <p className="text-stone-400 text-center py-20">No awards found.</p>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="px-6 py-3 rounded-full outline outline-1 -outline-offset-1 outline-red-600 text-red-600 font-montserrat font-semibold text-sm uppercase leading-5 hover:bg-red-600 hover:text-white transition-colors duration-150"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
