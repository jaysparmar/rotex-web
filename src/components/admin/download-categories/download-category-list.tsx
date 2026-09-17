"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Tag, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { DownloadCategoryFormDialog } from "@/components/admin/download-categories/download-category-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteDownloadCategory } from "@/app/admin/(dashboard)/download-categories/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

type DownloadCategory = { id: string; name: string; importReference: string | null };

export function DownloadCategoryList({
  categories,
  total,
  page,
  pageSize,
  q,
}: {
  categories: DownloadCategory[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<DownloadCategory | null>(null);
  const { pageHref } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteDownloadCategory(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch {
        toast.error(`Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Link href="/admin/products/import">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Upload className="size-3.5" />
              Import Downloads
            </Button>
          </Link>
          <DownloadCategoryFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                Add Category
              </Button>
            }
          />
        </div>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={q ? "No download categories match your search" : "No download categories yet"}
          description={
            q ? "Try a different search." : "Add a category so it can be picked when attaching a download to a product or variant."
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium">{category.name}</p>
                {category.importReference && (
                  <p className="text-xs text-muted-foreground">Ref: {category.importReference}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <DownloadCategoryFormDialog
                  category={category}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-3.5" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending}
                  onClick={() => setToDelete(category)}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <AdminPagination page={page} totalPages={totalPages} total={total} itemLabel="category" itemLabelPlural="categories" pageHref={pageHref} />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete download category"
        description={`Delete category "${toDelete?.name}"? Downloads already using it will fall back to "Document". This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
