"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Download as DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadFormDialog } from "@/components/admin/downloads/download-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteDownloadItem, toggleDownloadItemPublished } from "@/app/admin/(dashboard)/downloads/actions";
import { DOWNLOAD_TABS } from "@/lib/downloads-data";

type DownloadItem = {
  id: string;
  tab: string;
  title: string;
  language: string;
  fileType: string;
  fileSizeLabel: string;
  fileUrl: string;
  image: string;
  product: string;
  subCategory: string;
  productCertificateType: string;
  qmsCertificateType: string;
  industry: string;
  published: boolean;
};

export function DownloadList({ items }: { items: DownloadItem[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<DownloadItem | null>(null);
  const [tabFilter, setTabFilter] = useState<string>("all");

  const filters = useMemo(
    () => [
      { id: "all", label: "All", count: items.length },
      ...DOWNLOAD_TABS.map((t) => ({ id: t.id, label: t.label, count: items.filter((i) => i.tab === t.id).length })),
    ],
    [items]
  );

  const filteredItems = tabFilter === "all" ? items : items.filter((i) => i.tab === tabFilter);

  function confirmDelete() {
    if (!toDelete) return;
    const title = toDelete.title;
    startTransition(async () => {
      try {
        await deleteDownloadItem(toDelete.id);
        toast.success(`"${title}" deleted`);
      } catch {
        toast.error(`Failed to delete "${title}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(item: DownloadItem, published: boolean) {
    startTransition(async () => {
      try {
        await toggleDownloadItemPublished(item.id, published);
        toast.success(`"${item.title}" ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error(`Failed to update "${item.title}"`);
      }
    });
  }

  function tabLabel(tab: string) {
    return DOWNLOAD_TABS.find((t) => t.id === tab)?.label ?? tab;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={tabFilter} onValueChange={(v) => setTabFilter(v as string)}>
          <TabsList className="h-auto flex-wrap">
            {filters.map((f) => (
              <TabsTrigger key={f.id} value={f.id} className="gap-1.5">
                {f.label}
                <span className="text-[10px] opacity-70">{f.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <DownloadFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Download
            </Button>
          }
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState icon={DownloadIcon} title="No downloads yet" description="Add a download to get started." />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {filteredItems.map((item) => (
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
                {item.language} | .{item.fileType} | {item.fileSizeLabel || "—"}
              </p>
            </div>

            <Switch
              checked={item.published}
              disabled={pending}
              onCheckedChange={(v) => handleTogglePublished(item, v)}
            />

            <DownloadFormDialog
              item={item}
              trigger={
                <Button variant="ghost" size="icon-sm">
                  <Pencil className="size-3.5" />
                </Button>
              }
            />

            <Button variant="ghost" size="icon-sm" disabled={pending} onClick={() => setToDelete(item)}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete download"
        description={`Delete "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
