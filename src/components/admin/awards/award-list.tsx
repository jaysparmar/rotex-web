"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AwardFormDialog } from "@/components/admin/awards/award-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteAward, toggleAwardPublished } from "@/app/admin/(dashboard)/awards/actions";

type Award = {
  id: string;
  title: string;
  slug: string;
  year: string;
  description: string;
  url: string;
  image: string;
  published: boolean;
};

export function AwardList({ awards }: { awards: Award[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Award | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const title = toDelete.title;
    startTransition(async () => {
      try {
        await deleteAward(toDelete.id);
        toast.success(`"${title}" deleted`);
      } catch {
        toast.error(`Failed to delete "${title}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(award: Award, published: boolean) {
    startTransition(async () => {
      try {
        await toggleAwardPublished(award.id, published);
        toast.success(`"${award.title}" ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error(`Failed to update "${award.title}"`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AwardFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Award
            </Button>
          }
        />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {awards.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No awards yet.</p>
        )}
        {awards.map((award) => (
          <div key={award.id} className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {award.image && (
                <Image
                  src={award.image}
                  alt={award.title}
                  width={48}
                  height={48}
                  className="size-full object-cover"
                  unoptimized
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{award.title}</p>
              <p className="text-xs text-muted-foreground">{award.year}</p>
            </div>

            <Switch
              checked={award.published}
              disabled={pending}
              onCheckedChange={(v) => handleTogglePublished(award, v)}
            />

            <AwardFormDialog
              award={award}
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
              onClick={() => setToDelete(award)}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete award"
        description={`Delete award "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
