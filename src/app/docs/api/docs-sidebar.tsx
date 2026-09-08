"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { DocGroup } from "./parse-docs";

const METHOD_COLOR: Record<string, string> = {
  GET: "text-emerald-600",
  POST: "text-blue-600",
  PUT: "text-amber-600",
  DELETE: "text-[#EF3E23]",
};

export function DocsSidebar({ groups }: { groups: DocGroup[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const targets = groups.flatMap((g) => g.sections).map((s) => document.getElementById(s.slug));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-64px 0px -70% 0px" }
    );
    targets.forEach((t) => t && observer.observe(t));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <nav className="sticky top-6 max-h-[calc(100vh-3rem)] w-64 shrink-0 space-y-6 overflow-y-auto pr-4 text-sm">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.sections.map((section) => (
              <a
                key={section.slug}
                href={`#${section.slug}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active === section.slug && "bg-muted font-medium text-foreground"
                )}
              >
                {section.method && (
                  <span className={cn("w-9 shrink-0 text-[10px] font-bold", METHOD_COLOR[section.method])}>
                    {section.method}
                  </span>
                )}
                <span className="truncate">{section.title}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
