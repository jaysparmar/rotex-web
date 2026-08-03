"use client";
import React from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import defaultBg from "@/assets/Images/breadcurmbBackgrounds/default_bg.jpg";

type PageHeroProps = {
  title: string;
  description?: string;
  bg?: StaticImageData | string;
  children?: React.ReactNode;
};

const SEGMENT_LABEL_OVERRIDES: Record<string, string> = {
  about: "About Us",
  awards: "Awards & Recognition",
  "oil-gas": "Oil & Gas",
};

// Segments with no landing page of their own — skipped in the trail so it reads
// Home / Oil & Gas / Upstream rather than Home / Industries / Oil Gas / Upstream.
const HIDDEN_CRUMB_SEGMENTS = new Set(["industries"]);

function slugToLabel(slug: string): string {
  if (SEGMENT_LABEL_OVERRIDES[slug]) return SEGMENT_LABEL_OVERRIDES[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function PageHero({ title, description, bg, children }: PageHeroProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [
    { label: "Home", href: "/" },
    // hrefs are built before filtering so the remaining crumbs keep their full paths
    ...segments
      .map((seg, i) => ({
        seg,
        label: slugToLabel(seg),
        href: i === segments.length - 1 ? undefined : "/" + segments.slice(0, i + 1).join("/"),
      }))
      .filter((crumb) => !HIDDEN_CRUMB_SEGMENTS.has(crumb.seg)),
  ];

  return (
    <section className="relative w-full h-128.5 lg:h-157.5 overflow-hidden">
      <Image
        src={bg ?? defaultBg}
        alt=""
        fill
        priority
        className="object-cover object-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)" }} />

      <div className="container relative z-10 h-full flex flex-col justify-between pt-36 pb-20">
        {/* Breadcrumb trail */}
        <nav className="flex items-center gap-3" aria-label="Breadcrumb">
          {crumbs.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && (
                <span className="text-subtext text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
                  /
                </span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-subtext text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-red-600 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Title + description + optional slot */}
        <div className="max-w-212 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-gradient-hero text-5xl font-normal font-montserrat leading-15">
              {title}
            </h1>
            {description && (
              <p className="w-121.25 text-subtext text-lg font-medium font-montserrat leading-6">
                {description}
              </p>
            )}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </section>
  );
}
