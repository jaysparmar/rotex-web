"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Download as DownloadIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/admin/empty-state";
import { Pagination } from "@/components/ui/pagination";

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
const PAGE_SIZE = 20;

export function ProductDownloadList({
  items,
  categories,
}: {
  items: ProductSourcedDownload[];
  categories: { id: string; name: string }[];
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => [
      { id: ALL, label: "All", count: items.length },
      ...categories.map((c) => ({ id: c.id, label: c.name, count: items.filter((i) => i.categoryId === c.id).length })),
    ],
    [items, categories]
  );

  const filteredItems = categoryFilter === ALL ? items : items.filter((i) => i.categoryId === categoryFilter);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeCategory(id: string) {
    setCategoryFilter(id);
    setPage(1);
  }

  if (items.length === 0) {
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
      <Tabs value={categoryFilter} onValueChange={(v) => changeCategory(v as string)}>
        <TabsList className="h-auto flex-wrap">
          {filters.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="gap-1.5">
              {f.label}
              <span className="text-[10px] opacity-70">{f.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visibleItems.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState icon={DownloadIcon} title="No downloads in this category" description="Try a different category." />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {visibleItems.map((item) => (
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

      <div className="flex justify-end">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
