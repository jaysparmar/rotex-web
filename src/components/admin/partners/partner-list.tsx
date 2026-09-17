"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Handshake, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { PartnerFormDialog } from "@/components/admin/partners/partner-form-dialog";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deletePartner, togglePartnerPublished } from "@/app/admin/(dashboard)/partners/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

type Partner = { id: string; name: string; logo: string; published: boolean };

const PUBLISHED_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Published" },
  { value: "false", label: "Unpublished" },
];

export function PartnerList({
  partners,
  total,
  page,
  pageSize,
  q,
  published,
}: {
  partners: Partner[];
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

        <PartnerFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Partner
            </Button>
          }
        />
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={Handshake}
            title={q || published ? "No partners match your filters" : "No partners yet"}
            description={q || published ? "Try a different search or filter." : "Add a partner to get started."}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner) => (
            <div key={partner.id} className="space-y-2">
              <ImageLightboxTrigger
                src={partner.logo}
                alt={partner.name}
                className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30"
              >
                {partner.logo && (
                  <div className="relative size-20">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </ImageLightboxTrigger>

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

      {total > 0 && (
        <AdminPagination page={page} totalPages={totalPages} total={total} itemLabel="partner" pageHref={pageHref} />
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
