"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteSubIndustry } from "@/app/admin/(dashboard)/industries/actions";

type SubIndustryRow = { id: string; name: string; slug: string };

export function SubIndustryList({
  industryId,
  subIndustries,
}: {
  industryId: string;
  subIndustries: SubIndustryRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<SubIndustryRow | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteSubIndustry(toDelete.id);
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
          <h2 className="text-sm font-semibold">Sub-Industries ({subIndustries.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Each sub-industry has its own challenges, solutions, recommended products, and customer stories.
          </p>
        </div>
        <Link href={`/admin/industries/${industryId}/sub-industries/new`}>
          <Button size="sm" className="shrink-0 gap-1.5">
            <Plus className="size-3.5" />
            Add Sub-Industry
          </Button>
        </Link>
      </div>
      {subIndustries.length === 0 ? (
        <EmptyState icon={Layers} title="No sub-industries yet" description="Add a sub-industry to get started." />
      ) : (
        <div className="divide-y divide-border">
          {subIndustries.map((sub) => (
            <div key={sub.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium">{sub.name}</p>
                <p className="text-xs text-muted-foreground">{sub.slug}</p>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/admin/industries/${industryId}/sub-industries/${sub.id}`}>
                  <Button variant="ghost" size="icon-sm">
                    <Pencil className="size-3.5" />
                  </Button>
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
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete sub-industry"
        description={`Delete "${toDelete?.name}"? This also deletes its customer stories. This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
