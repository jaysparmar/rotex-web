"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteVariant } from "@/app/admin/(dashboard)/products/actions";

type VariantRow = {
  id: string;
  size: string | null;
  variantType: string | null;
  orifice: string | null;
  minOperatingTemp: string | null;
  maxOperatingTemp: string | null;
  flowFactor: string | null;
};

function variantLabel(v: VariantRow): string {
  return [v.size, v.variantType, v.orifice, v.minOperatingTemp, v.maxOperatingTemp, v.flowFactor]
    .filter(Boolean)
    .join(" / ") || "Unnamed variant";
}

export function VariantList({ productId, variants }: { productId: string; variants: VariantRow[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<VariantRow | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const label = variantLabel(toDelete);
    startTransition(async () => {
      try {
        await deleteVariant(toDelete.id);
        toast.success(`"${label}" deleted`);
      } catch {
        toast.error(`Failed to delete "${label}"`);
      }
    });
    setToDelete(null);
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between gap-4 border-b border-border p-5">
        <h2 className="text-sm font-semibold">Variants ({variants.length})</h2>
        <Link href={`/admin/products/${productId}/variants/new`}>
          <Button size="sm" className="shrink-0 gap-1.5">
            <Plus className="size-3.5" />
            Add Variant
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border">
        {variants.length === 0 && <p className="p-5 text-sm text-muted-foreground">No variants.</p>}
        {variants.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-4 p-5">
            <p className="text-sm font-medium">{variantLabel(v)}</p>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/products/${productId}/variants/${v.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Edit
              </Link>
              <Button variant="ghost" size="icon-sm" disabled={pending} onClick={() => setToDelete(v)}>
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete variant"
        description={`Delete "${toDelete ? variantLabel(toDelete) : ""}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
