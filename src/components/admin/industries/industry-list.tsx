"use client";

import { useState, useTransition, Fragment } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, ChevronRight, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteIndustry, deleteSubIndustry } from "@/app/admin/(dashboard)/industries/actions";

type SubIndustryRow = { id: string; name: string; slug: string };
type IndustryRow = { id: string; name: string; slug: string; subIndustryCount: number; subIndustries: SubIndustryRow[] };

type DeleteTarget = { kind: "industry"; industry: IndustryRow } | { kind: "sub"; sub: SubIndustryRow };

export function IndustryList({ industries }: { industries: IndustryRow[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<DeleteTarget | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.kind === "industry" ? toDelete.industry.name : toDelete.sub.name;
    startTransition(async () => {
      try {
        if (toDelete.kind === "industry") await deleteIndustry(toDelete.industry.id);
        else await deleteSubIndustry(toDelete.sub.id);
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
        <Link href="/admin/industries/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            Add Industry
          </Button>
        </Link>
      </div>

      {industries.length === 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <EmptyState icon={Factory} title="No industries yet" description="Add an industry to get started." />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sub-Industries</TableHead>
              <TableHead className="pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {industries.map((industry) => {
              const isExpanded = expanded.has(industry.id);
              return (
                <Fragment key={industry.id}>
                  <TableRow hoverable>
                    <TableCell className="pl-5 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(industry.id)}
                        disabled={industry.subIndustryCount === 0}
                        className="flex items-center gap-1.5 disabled:cursor-default"
                      >
                        {industry.subIndustryCount > 0 && (
                          <ChevronRight
                            className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                        )}
                        {industry.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{industry.slug}</TableCell>
                    <TableCell>{industry.subIndustryCount}</TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/industries/${industry.id}`}>
                          <Button variant="ghost" size="icon-sm">
                            <Pencil className="size-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={pending}
                          onClick={() => setToDelete({ kind: "industry", industry })}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded &&
                    industry.subIndustries.map((sub) => (
                      <TableRow key={sub.id} className="bg-muted/20">
                        <TableCell className="pl-11 text-muted-foreground">{sub.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{sub.slug}</TableCell>
                        <TableCell />
                        <TableCell className="pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/industries/${industry.id}/sub-industries/${sub.id}`}>
                              <Button variant="ghost" size="icon-sm">
                                <Pencil className="size-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={pending}
                              onClick={() => setToDelete({ kind: "sub", sub })}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={toDelete?.kind === "sub" ? "Delete sub-industry" : "Delete industry"}
        description={
          toDelete?.kind === "sub"
            ? `Delete "${toDelete.sub.name}"? This cannot be undone.`
            : `Delete "${toDelete?.kind === "industry" ? toDelete.industry.name : ""}"? This also deletes all its sub-industries and customer stories. This cannot be undone.`
        }
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
