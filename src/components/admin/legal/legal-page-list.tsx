"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Scale, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { LegalPageCreateDialog } from "@/components/admin/legal/legal-page-create-dialog";
import { deleteLegalPage } from "@/app/admin/(dashboard)/legal/actions";

const LEGACY_PUBLIC_PATH: Record<string, string> = {
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
};

type LegalPageRow = { key: string; title: string; updatedAt: string };

export function LegalPageList({ pages }: { pages: LegalPageRow[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<LegalPageRow | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const { key, title } = toDelete;
    startTransition(async () => {
      try {
        await deleteLegalPage(key);
        toast.success(`"${title}" deleted`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to delete "${title}"`);
      }
    });
    setToDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LegalPageCreateDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Legal Page
            </Button>
          }
        />
      </div>

      {pages.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState icon={Scale} title="No legal pages yet" description="Add a legal page to get started." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.key} className="relative">
              <Link href={`/admin/legal/${page.key}`} className="block transition-colors hover:border-primary">
                <CardContent className="p-4 pr-20">
                  <p className="font-medium">{page.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {LEGACY_PUBLIC_PATH[page.key] ?? `/${page.key}`} · Last updated{" "}
                    {new Date(page.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Link>
              <div className="absolute right-3 top-3 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={<Link href={`/admin/legal/${page.key}`} />}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending}
                  onClick={() => setToDelete(page)}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete legal page"
        description={`Delete "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
