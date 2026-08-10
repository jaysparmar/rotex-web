"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  deleteCategory,
  toggleCategoryPublished,
} from "@/app/admin/(dashboard)/categories/actions";
import { cn } from "@/lib/utils";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image: string | null;
  order: number;
  published: boolean;
  parentId: string | null;
};

function CategoryRowItem({
  category,
  indented,
  pending,
  parentOptions,
  onDelete,
  onTogglePublished,
}: {
  category: CategoryRow;
  indented: boolean;
  pending: boolean;
  parentOptions: { id: string; name: string }[];
  onDelete: (c: CategoryRow) => void;
  onTogglePublished: (c: CategoryRow, published: boolean) => void;
}) {
  return (
    <div className={cn("flex items-center gap-4 p-4", indented && "pl-12")}>
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            width={48}
            height={48}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <Layers className="size-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{category.name}</p>
        <p className="text-xs text-muted-foreground truncate">{category.tagline}</p>
      </div>

      <Switch
        checked={category.published}
        disabled={pending}
        onCheckedChange={(v) => onTogglePublished(category, v)}
      />

      <CategoryFormDialog
        category={category}
        parentOptions={parentOptions}
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
        onClick={() => onDelete(category)}
      >
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}

export function CategoryList({ categories }: { categories: CategoryRow[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null);

  const topLevel = categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const childrenByParent = new Map<string, CategoryRow[]>();
  for (const c of categories) {
    if (!c.parentId) continue;
    const list = childrenByParent.get(c.parentId) ?? [];
    list.push(c);
    childrenByParent.set(c.parentId, list);
  }

  const parentOptions = topLevel.map((c) => ({ id: c.id, name: c.name }));

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteCategory(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(category: CategoryRow, published: boolean) {
    startTransition(async () => {
      try {
        await toggleCategoryPublished(category.id, published);
        toast.success(`"${category.name}" ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error(`Failed to update "${category.name}"`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CategoryFormDialog
          parentOptions={parentOptions}
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Category
            </Button>
          }
        />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {topLevel.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No categories yet.</p>
        )}
        {topLevel.map((category) => (
          <div key={category.id}>
            <CategoryRowItem
              category={category}
              indented={false}
              pending={pending}
              parentOptions={parentOptions}
              onDelete={setToDelete}
              onTogglePublished={handleTogglePublished}
            />
            {(childrenByParent.get(category.id) ?? [])
              .sort((a, b) => a.order - b.order)
              .map((child) => (
                <CategoryRowItem
                  key={child.id}
                  category={child}
                  indented
                  pending={pending}
                  parentOptions={parentOptions}
                  onDelete={setToDelete}
                  onTogglePublished={handleTogglePublished}
                />
              ))}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete category"
        description={`Delete category "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
