"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteSubCategory } from "@/app/admin/(dashboard)/companies/actions";

type SubCategoryRow = { id: string; name: string; slug: string };

export function SubCategoryList({
  companyId,
  categoryId,
  subCategories,
}: {
  companyId: string;
  categoryId: string;
  subCategories: SubCategoryRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<SubCategoryRow | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteSubCategory(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch {
        toast.error(`Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 className="text-sm font-semibold">Sub-Categories ({subCategories.length})</h2>
        </div>
        <Link href={`/admin/companies/${companyId}/categories/${categoryId}/sub-categories/new`}>
          <Button size="sm" className="shrink-0 gap-1.5">
            <Plus className="size-3.5" />
            Add Sub-Category
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border">
        {subCategories.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">No sub-categories.</p>
        )}
        {subCategories.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-medium">{sub.name}</p>
              <p className="text-xs text-muted-foreground">{sub.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/companies/${companyId}/categories/${categoryId}/sub-categories/${sub.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Edit
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                onClick={() => setToDelete(sub)}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete sub-category"
        description={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
