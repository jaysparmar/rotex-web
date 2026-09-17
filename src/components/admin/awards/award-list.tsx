"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Award as AwardIcon, Pencil, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { AwardFormDialog } from "@/components/admin/awards/award-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteAward, toggleAwardPublished } from "@/app/admin/(dashboard)/awards/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

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

const PUBLISHED_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Published" },
  { value: "false", label: "Unpublished" },
];

export function AwardList({
  awards,
  total,
  page,
  pageSize,
  q,
  year,
  published,
  years,
}: {
  awards: Award[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  year: string;
  published: string;
  years: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Award | null>(null);
  const { pageHref, setParam } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);
  const yearOptions = [{ value: "", label: "All years" }, ...years.map((y) => ({ value: y, label: y }))];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select items={yearOptions} value={year} onValueChange={(v) => setParam("year", v as string)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        <AwardFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Award
            </Button>
          }
        />
      </div>

      {awards.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={AwardIcon}
            title={q || year || published ? "No awards match your filters" : "No awards yet"}
            description={q || year || published ? "Try a different search or filter." : "Add an award to get started."}
          />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {awards.map((award) => (
            <div key={award.id} className="flex flex-wrap items-center gap-4 p-4">
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

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{award.title}</p>
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
      )}

      {total > 0 && (
        <AdminPagination page={page} totalPages={totalPages} total={total} itemLabel="award" pageHref={pageHref} />
      )}

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
