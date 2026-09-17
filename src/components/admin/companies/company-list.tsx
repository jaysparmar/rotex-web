"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteCompany } from "@/app/admin/(dashboard)/companies/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

type CompanyRow = { id: string; name: string; slug: string; categoryCount: number };

export function CompanyList({
  companies,
  total,
  page,
  pageSize,
  q,
}: {
  companies: CompanyRow[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<CompanyRow | null>(null);
  const { pageHref } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteCompany(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch {
        toast.error(`Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Link href="/admin/companies/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            Add Company
          </Button>
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <EmptyState
            icon={Building2}
            title={q ? "No companies match your search" : "No companies yet"}
            description={q ? "Try a different search." : "Add a company to get started."}
          />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id} hoverable>
                <TableCell className="pl-5 font-medium">{company.name}</TableCell>
                <TableCell className="text-muted-foreground">{company.slug}</TableCell>
                <TableCell>{company.categoryCount}</TableCell>
                <TableCell className="pr-5">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/companies/${company.id}`}>
                      <Button variant="ghost" size="icon-sm">
                        <Pencil className="size-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={pending}
                      onClick={() => setToDelete(company)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {total > 0 && (
        <AdminPagination page={page} totalPages={totalPages} total={total} itemLabel="company" itemLabelPlural="companies" pageHref={pageHref} />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete company"
        description={`Delete "${toDelete?.name}"? This also deletes all its categories and sub-categories. This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
