"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CertificationFormDialog } from "@/components/admin/certifications/certification-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCertification, toggleCertificationPublished } from "@/app/admin/(dashboard)/certifications/actions";

type Certification = { id: string; name: string; logo: string; published: boolean };

export function CertificationList({ certifications }: { certifications: Certification[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Certification | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteCertification(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch {
        toast.error(`Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(certification: Certification, published: boolean) {
    startTransition(async () => {
      try {
        await toggleCertificationPublished(certification.id, published);
        toast.success(`"${certification.name}" ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error(`Failed to update "${certification.name}"`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CertificationFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Certification
            </Button>
          }
        />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {certifications.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No certifications yet.</p>
        )}
        {certifications.map((certification) => (
          <div key={certification.id} className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {certification.logo && (
                <Image
                  src={certification.logo}
                  alt={certification.name}
                  width={48}
                  height={48}
                  className="size-full object-contain"
                  unoptimized
                />
              )}
            </div>

            <span className="flex-1 text-sm font-medium">{certification.name}</span>

            <Switch
              checked={certification.published}
              disabled={pending}
              onCheckedChange={(v) => handleTogglePublished(certification, v)}
            />

            <CertificationFormDialog
              certification={certification}
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
              onClick={() => setToDelete(certification)}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete certification"
        description={`Delete certification "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
