"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Download as DownloadIcon, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

export type ProductSourcedDownload = {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  fileUrl: string;
  image: string | null;
  productName: string;
  variantLabel: string | null;
  editHref: string;
};

const ALL = "all";

export function ProductDownloadList({
  items,
  total,
  page,
  pageSize,
  q,
  categoryId,
  categories,
  tabCounts,
  totalAll,
}: {
  items: ProductSourcedDownload[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  categoryId: string;
  categories: { id: string; name: string }[];
  tabCounts: Record<string, number>;
  totalAll: number;
}) {
  const { pageHref, setParam } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tabs = [
    { id: ALL, label: "All", count: totalAll },
    ...categories.map((c) => ({ id: c.id, label: c.name, count: tabCounts[c.id] ?? 0 })),
  ];

  if (totalAll === 0) {
    return (
      <div className="rounded-lg border border-border">
        <EmptyState
          icon={DownloadIcon}
          title="No product downloads shown here"
          description="Attach a download to a product or variant to have it appear on this list and on /downloads."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={categoryId} onValueChange={(v) => setParam("categoryId", v === ALL ? undefined : (v as string))}>
        <TabsList className="h-auto flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
              {t.label}
              <span className="text-[10px] opacity-70">{t.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or product..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={DownloadIcon}
            title="No downloads match your filters"
            description="Try a different category or search."
          />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {item.image ? (
                  <Image src={item.image} alt={item.title} width={48} height={48} className="size-full object-cover" unoptimized />
                ) : (
                  <FileText className="size-5 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <Badge variant="secondary" className="shrink-0">{item.categoryName}</Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {item.productName}
                  {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                </p>
              </div>

              <Button variant="ghost" size="sm" className="gap-1.5" render={<Link href={item.editHref} />}>
                <ExternalLink className="size-3.5" />
                Edit on product
              </Button>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <AdminPagination page={page} totalPages={totalPages} total={total} itemLabel="download" pageHref={pageHref} />
      )}
    </div>
  );
}
