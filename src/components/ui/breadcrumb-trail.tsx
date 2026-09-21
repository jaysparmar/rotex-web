"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

type Variant = "light" | "dark";

const VARIANT_STYLES: Record<Variant, { base: string; hover: string; active: string }> = {
  light: { base: "text-stone-900", hover: "hover:text-[#EF3E23]", active: "text-[#EF3E23]" },
  dark: { base: "text-subtext", hover: "hover:text-white", active: "text-[#EF3E23]" },
};

function CrumbItem({
  crumb,
  isLast,
  showSeparator,
  variant,
}: {
  crumb: Crumb;
  isLast: boolean;
  showSeparator: boolean;
  variant: Variant;
}) {
  const styles = VARIANT_STYLES[variant];
  return (
    <span className={cn("flex items-center gap-3", isLast && "min-w-0")}>
      {showSeparator && (
        <span
          className={cn(
            "shrink-0 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide",
            styles.base
          )}
        >
          /
        </span>
      )}
      {crumb.href ? (
        <Link
          href={crumb.href}
          className={cn(
            "shrink-0 text-sm font-semibold font-montserrat leading-5 transition-colors",
            styles.base,
            styles.hover
          )}
        >
          {crumb.label}
        </Link>
      ) : isLast ? (
        <span className={cn("truncate text-sm font-semibold font-montserrat leading-5", styles.active)}>
          {crumb.label}
        </span>
      ) : (
        <span className={cn("shrink-0 text-sm font-semibold font-montserrat leading-5", styles.base)}>
          {crumb.label}
        </span>
      )}
    </span>
  );
}

// Shows the full trail whenever it fits on one line; only collapses the
// middle crumbs to "..." once the full trail would actually wrap.
export function BreadcrumbTrail({
  crumbs,
  variant = "light",
  className,
}: {
  crumbs: Crumb[];
  variant?: Variant;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(true);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const check = () => setFits(measure.scrollWidth <= container.clientWidth);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(container);
    return () => observer.disconnect();
  }, [crumbs]);

  const collapsed = crumbs.length > 3 ? [crumbs[0], { label: "..." }, crumbs[crumbs.length - 1]] : crumbs;
  const display = fits ? crumbs : collapsed;

  return (
    <div ref={containerRef} className={cn("relative w-full min-w-0", className)}>
      <div ref={measureRef} className="invisible absolute flex items-center gap-3 whitespace-nowrap" aria-hidden>
        {crumbs.map((crumb, i) => (
          <CrumbItem key={i} crumb={crumb} isLast={i === crumbs.length - 1} showSeparator={i > 0} variant={variant} />
        ))}
      </div>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-3 overflow-hidden">
        {display.map((crumb, i) => (
          <CrumbItem key={i} crumb={crumb} isLast={i === display.length - 1} showSeparator={i > 0} variant={variant} />
        ))}
      </nav>
    </div>
  );
}
