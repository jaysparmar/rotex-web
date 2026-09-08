"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadCategoryFormDialog } from "@/components/admin/download-categories/download-category-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteDownloadCategory } from "@/app/admin/(dashboard)/download-categories/actions";

type DownloadCategory = { id: string; name: string };

export function DownloadCategoryList({ categories }: { categories: DownloadCategory[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<DownloadCategory | null>(null);

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
      <div className="flex justify-end">
        <DownloadCategoryFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Category
            </Button>
          }
        />
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No download categories yet"
          description="Add a category so it can be picked when attaching a download to a product or variant."
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <p className="text-sm font-medium">{category.name}</p>
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
