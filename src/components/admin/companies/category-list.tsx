"use client";

import { useState, useTransition, Fragment } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCategory, deleteSubCategory } from "@/app/admin/(dashboard)/companies/actions";

type SubCategoryRow = { id: string; name: string; slug: string };
type CategoryRow = { id: string; name: string; slug: string; subCategories: SubCategoryRow[] };

type DeleteTarget = { kind: "category"; category: CategoryRow } | { kind: "sub"; sub: SubCategoryRow };

export function CategoryList({ companyId, categories }: { companyId: string; categories: CategoryRow[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<DeleteTarget | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.kind === "category" ? toDelete.category.name : toDelete.sub.name;
    startTransition(async () => {
      try {
        if (toDelete.kind === "category") await deleteCategory(toDelete.category.id);
        else await deleteSubCategory(toDelete.sub.id);
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
          <h2 className="text-sm font-semibold">Categories ({categories.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">Each category can have its own sub-categories.</p>
        </div>
        <Link href={`/admin/companies/${companyId}/categories/new`}>
          <Button size="sm" className="shrink-0 gap-1.5">
            <Plus className="size-3.5" />
            Add Category
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-border">
            {categories.length === 0 && (
              <tr>
                <td className="py-8 text-center text-sm text-muted-foreground">No categories yet.</td>
              </tr>
            )}
            {categories.map((category) => {
              const isExpanded = expanded.has(category.id);
              return (
                <Fragment key={category.id}>
                  <tr>
                    <td className="py-2.5 pl-5 pr-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(category.id)}
                        disabled={category.subCategories.length === 0}
                        className="flex items-center gap-1.5 disabled:cursor-default"
                      >
                        {category.subCategories.length > 0 && (
                          <ChevronRight
                            className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                        )}
                        {category.name}
                      </button>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{category.slug}</td>
                    <td className="py-2.5 pr-3">{category.subCategories.length} sub-categories</td>
                    <td className="py-2.5 pr-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/companies/${companyId}/categories/${category.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={pending}
                          onClick={() => setToDelete({ kind: "category", category })}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded &&
                    category.subCategories.map((sub) => (
                      <tr key={sub.id} className="bg-muted/20">
                        <td className="py-2 pl-11 pr-3 text-muted-foreground">{sub.name}</td>
                        <td className="py-2 pr-3 text-xs text-muted-foreground">{sub.slug}</td>
                        <td className="py-2 pr-3" />
                        <td className="py-2 pr-5">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/companies/${companyId}/categories/${category.id}/sub-categories/${sub.id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Edit
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={pending}
                              onClick={() => setToDelete({ kind: "sub", sub })}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={toDelete?.kind === "sub" ? "Delete sub-category" : "Delete category"}
        description={
          toDelete?.kind === "sub"
            ? `Delete "${toDelete.sub.name}"? This cannot be undone.`
            : `Delete "${toDelete?.kind === "category" ? toDelete.category.name : ""}"? This also deletes all its sub-categories. This cannot be undone.`
        }
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
