"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteCompany } from "@/app/admin/(dashboard)/companies/actions";

type CompanyRow = { id: string; name: string; slug: string; categoryCount: number };

export function CompanyList({ companies }: { companies: CompanyRow[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<CompanyRow | null>(null);

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
      <div className="flex justify-end">
        <Link href="/admin/companies/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            Add Company
          </Button>
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <EmptyState icon={Building2} title="No companies yet" description="Add a company to get started." />
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
