"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PartnerFormDialog } from "@/components/admin/partners/partner-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deletePartner, togglePartnerPublished } from "@/app/admin/(dashboard)/partners/actions";

type Partner = { id: string; name: string; logo: string; published: boolean };

export function PartnerList({ partners }: { partners: Partner[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Partner | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deletePartner(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch {
        toast.error(`Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(partner: Partner, published: boolean) {
    startTransition(async () => {
      try {
        await togglePartnerPublished(partner.id, published);
        toast.success(`"${partner.name}" ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error(`Failed to update "${partner.name}"`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PartnerFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Partner
            </Button>
          }
        />
      </div>

      {partners.length === 0 ? (
        <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          No partners yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner) => (
            <div key={partner.id} className="space-y-2">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                {partner.logo && (
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain p-3"
                    unoptimized
                  />
                )}
              </div>

              <p className="truncate text-sm font-medium">{partner.name}</p>

              <div className="flex items-center justify-between gap-1">
                <Switch
                  checked={partner.published}
                  disabled={pending}
                  onCheckedChange={(v) => handleTogglePublished(partner, v)}
                />

                <div className="flex items-center gap-1">
                  <PartnerFormDialog
                    partner={partner}
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
                    onClick={() => setToDelete(partner)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete partner"
        description={`Delete partner "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
