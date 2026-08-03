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
    // Figma: 625px on mobile, 630px on desktop
    <section className="relative w-full h-156.25 lg:h-157.5 overflow-hidden">
      <Image
        src={bg ?? defaultBg}
        alt=""
        fill
        priority
        className="object-cover object-center"
        aria-hidden="true"
      />
      {/* Scrim — mobile. Figma exports this as bg-linear-333, but a CSS 333deg
          gradient points up-left, putting the 75% black in the bottom-right
          corner and leaving the left-aligned copy on bare image. Bottom-weighted
          vertical instead, so breadcrumb, title, body and CTAs all sit on it. */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      {/* Figma desktop: bg-gradient-to-l from-black/0 to-black/90 */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)" }}
      />

      <div className="container relative z-10 h-full flex flex-col justify-between pt-36 pb-20">
        {/* Breadcrumb trail */}
        <nav className="flex items-center gap-3" aria-label="Breadcrumb">
          {crumbs.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && (
                <span className="text-subtext text-sm font-semibold font-montserrat leading-5">
                  /
                </span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-subtext text-sm font-semibold font-montserrat leading-5 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-red-600 text-sm font-semibold font-montserrat leading-5">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Title + description + optional slot — Figma mobile: gap-8 block,
            gap-2.5 between title and copy, 30px title, 14px/leading-5 body */}
        <div className="max-w-212 flex flex-col gap-8 lg:gap-6">
          <div className="flex flex-col gap-2.5 lg:gap-4">
            <h1 className="text-gradient-hero text-3xl lg:text-5xl font-normal font-montserrat leading-10 lg:leading-15">
              {title}
            </h1>
            {description && (
              <p className="w-full lg:w-121.25 text-subtext text-sm lg:text-lg font-medium font-montserrat leading-5 lg:leading-6">
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
