"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { CountryFormDialog } from "@/components/admin/countries/country-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteCountry, toggleCountryPublished } from "@/app/admin/(dashboard)/countries/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

type Country = {
  id: string;
  name: string;
  stateOrCity: string | null;
  partnerCompany: string | null;
  lat: number;
  lng: number;
  published: boolean;
};

const PUBLISHED_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Published" },
  { value: "false", label: "Unpublished" },
];

export function CountryList({
  countries,
  total,
  page,
  pageSize,
  q,
  published,
}: {
  countries: Country[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  published: string;
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Country | null>(null);
  const { pageHref, setParam } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteCountry(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch {
        toast.error(`Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(country: Country, published: boolean) {
    startTransition(async () => {
      try {
        await toggleCountryPublished(country.id, published);
        toast.success(`"${country.name}" ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error(`Failed to update "${country.name}"`);
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
              placeholder="Search by name, city, or partner..."
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

        <CountryFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Country
            </Button>
          }
        />
      </div>

      {countries.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={MapPin}
            title={q || published ? "No countries match your filters" : "No countries yet"}
            description={q || published ? "Try a different search or filter." : "Add a country to get started."}
          />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {countries.map((country) => (
            <div key={country.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30">
                <MapPin className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{country.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[country.stateOrCity, country.partnerCompany].filter(Boolean).join(" — ") ||
                    `${country.lat}, ${country.lng}`}
                </p>
              </div>

              <Switch
                checked={country.published}
                disabled={pending}
                onCheckedChange={(v) => handleTogglePublished(country, v)}
              />

              <CountryFormDialog
                country={country}
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
                onClick={() => setToDelete(country)}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          itemLabel="country"
          itemLabelPlural="countries"
          pageHref={pageHref}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete country"
        description={`Delete country "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
