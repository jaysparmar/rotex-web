import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Download as DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/empty-state";
import { DOWNLOAD_TABS } from "@/lib/downloads-data";

export type ProductSourcedDownload = {
  id: string;
  title: string;
  tab: string;
  fileUrl: string;
  image: string | null;
  productName: string;
  variantLabel: string | null;
  editHref: string;
};

function tabLabel(tab: string) {
  return DOWNLOAD_TABS.find((t) => t.id === tab)?.label ?? tab;
}

export function ProductDownloadList({ items }: { items: ProductSourcedDownload[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <EmptyState
          icon={DownloadIcon}
          title="No product downloads shown here"
          description='Toggle "Show on Downloads page" on a product/variant download to have it appear on this list and on /downloads.'
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {items.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center gap-4 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
            {item.image && (
              <Image src={item.image} alt={item.title} width={48} height={48} className="size-full object-cover" unoptimized />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <Badge variant="secondary" className="shrink-0">{tabLabel(item.tab)}</Badge>
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
  );
}
