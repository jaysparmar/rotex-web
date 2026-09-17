"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CertificationFormDialog } from "@/components/admin/certifications/certification-form-dialog";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCertification, toggleCertificationPublished } from "@/app/admin/(dashboard)/certifications/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

type Certification = { id: string; name: string; logo: string; published: boolean };

const PUBLISHED_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Published" },
  { value: "false", label: "Unpublished" },
];

export function CertificationList({
  certifications,
  total,
  page,
  pageSize,
  q,
  published,
}: {
  certifications: Certification[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  published: string;
}) {
  const { pageHref, setParam } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            items={PUBLISHED_OPTIONS}
            value={published}
            onValueChange={(v) => setParam("published", v as string)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {PUBLISHED_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CertificationFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Certification
            </Button>
          }
        />
      </div>

      {total === 0 ? (
        <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          {q || published ? "No certifications match your filters." : "No certifications yet."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {certifications.map((certification) => (
            <div key={certification.id} className="space-y-2">
              <ImageLightboxTrigger
                src={certification.logo}
                alt={certification.name}
                className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30"
              >
                {certification.logo && (
                  <div className="relative size-20">
                    <Image
                      src={certification.logo}
                      alt={certification.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </ImageLightboxTrigger>

              <p className="truncate text-sm font-medium">{certification.name}</p>

              <div className="flex items-center justify-between gap-1">
                <Switch
                  checked={certification.published}
                  disabled={pending}
                  onCheckedChange={(v) => handleTogglePublished(certification, v)}
                />

                <div className="flex items-center gap-1">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} certification{total === 1 ? "" : "s"} · Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
              <Button variant="outline" size="sm" disabled={page <= 1}>
                Previous
              </Button>
            </Link>
            <Link href={pageHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages}>
              <Button variant="outline" size="sm" disabled={page >= totalPages}>
                Next
              </Button>
            </Link>
          </div>
        </div>
      )}

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
