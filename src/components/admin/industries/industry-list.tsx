"use client";

import { useState, useTransition, Fragment } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
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
            New Industry
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2.5 pl-5 pr-3 font-medium">Name</th>
              <th className="py-2.5 pr-3 font-medium">Slug</th>
              <th className="py-2.5 pr-3 font-medium">Sub-Industries</th>
              <th className="py-2.5 pr-5 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {industries.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No industries yet.
                </td>
              </tr>
            )}
            {industries.map((industry) => {
              const isExpanded = expanded.has(industry.id);
              return (
                <Fragment key={industry.id}>
                  <tr>
                    <td className="py-2.5 pl-5 pr-3 font-medium">
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
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{industry.slug}</td>
                    <td className="py-2.5 pr-3">{industry.subIndustryCount}</td>
                    <td className="py-2.5 pr-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/industries/${industry.id}`} className="text-sm font-medium text-primary hover:underline">
                          Edit
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
                    </td>
                  </tr>
                  {isExpanded &&
                    industry.subIndustries.map((sub) => (
                      <tr key={sub.id} className="bg-muted/20">
                        <td className="py-2 pl-11 pr-3 text-muted-foreground">{sub.name}</td>
                        <td className="py-2 pr-3 text-xs text-muted-foreground">{sub.slug}</td>
                        <td className="py-2 pr-3" />
                        <td className="py-2 pr-5">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/industries/${industry.id}/sub-industries/${sub.id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Edit
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
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

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
