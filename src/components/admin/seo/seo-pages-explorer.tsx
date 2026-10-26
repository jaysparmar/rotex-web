"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, Pencil, Plus, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SeoItem = {
  key: string;
  label: string;
  sub?: string;
  path: string;
  group: string;
  groupLabel: string;
  configured: boolean;
  metaTitle?: string;
};

type Group = { id: string; label: string };

export function SeoPagesExplorer({ items, groups }: { items: SeoItem[]; groups: Group[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<string>("all");
  const [onlyMissing, setOnlyMissing] = useState(false);

  const total = items.length;
  const configuredCount = items.filter((i) => i.configured).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (tab !== "all" && i.group !== tab) return false;
      if (onlyMissing && i.configured) return false;
      if (!q) return true;
      return i.label.toLowerCase().includes(q) || i.sub?.toLowerCase().includes(q) || i.path.toLowerCase().includes(q);
    });
  }, [items, tab, query, onlyMissing]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total pages" value={total} />
        <StatCard label="Configured" value={configuredCount} tone="success" />
        <StatCard label="Not configured" value={total - configuredCount} tone="warning" />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search SEO pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant={onlyMissing ? "default" : "outline"}
          size="icon"
          title="Show only pages missing SEO"
          onClick={() => setOnlyMissing((v) => !v)}
        >
          <ListFilter className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabPill id="all" label="All Pages" active={tab === "all"} onClick={setTab} />
        {groups.map((g) => (
          <TabPill key={g.id} id={g.id} label={g.label} active={tab === g.id} onClick={setTab} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
          No pages match this search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((item) => (
            <SeoItemCard key={item.key} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold",
          tone === "success" && "text-success",
          tone === "warning" && "text-amber-500"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function TabPill({
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <Button variant={active ? "default" : "secondary"} size="sm" onClick={() => onClick(id)}>
      {label}
    </Button>
  );
}

function SeoItemCard({ item }: { item: SeoItem }) {
  return (
    <div className="flex flex-col rounded-lg border border-border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{item.label}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.path} · {item.group === "static" ? "Static page" : "Dynamic page"}
            {item.sub && ` · ${item.sub}`}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0",
            item.configured ? "border-success/30 bg-success/10 text-success" : "text-muted-foreground"
          )}
        >
          {item.configured ? "Configured" : "Not configured"}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {item.configured ? item.metaTitle : "Add a meta title and description to improve search visibility."}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{item.configured ? "Meta title configured" : ""}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={item.path} target="_blank" title="View on site" />}>
            <ArrowUpRight className="size-4" />
          </Button>
          <Button
            variant={item.configured ? "outline" : "default"}
            size="sm"
            nativeButton={false}
            render={<Link href={`/admin/seo/${item.key}`} />}
          >
            {item.configured ? (
              <>
                <Pencil className="mr-1.5 size-3.5" />
                Edit SEO
              </>
            ) : (
              <>
                <Plus className="mr-1.5 size-3.5" />
                Configure SEO
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
