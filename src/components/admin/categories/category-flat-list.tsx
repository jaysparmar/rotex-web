"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteCategory } from "@/app/admin/(dashboard)/companies/actions";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  companyId: string;
  companyName: string;
  productCount: number;
  subCategoryCount: number;
};

export function CategoryFlatList({ categories }: { categories: CategoryRow[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteCategory(toDelete.id);
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
        <h2 className="text-sm font-semibold">{categories.length} categories</h2>
        <Link href="/admin/categories/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            Add Category
          </Button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={Layers} title="No categories yet" description="Add a category to get started." />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Sub-categories</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} hoverable>
                  <TableCell className="pl-5 font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{category.companyName}</TableCell>
                  <TableCell>{category.productCount}</TableCell>
                  <TableCell>{category.subCategoryCount}</TableCell>
                  <TableCell className="pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/categories/${category.id}`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        onClick={() => setToDelete(category)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete category"
        description={`Delete "${toDelete?.name}"? This also deletes all its sub-categories. This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
