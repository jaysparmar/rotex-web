"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ResourceFormDialog, RESOURCE_TYPES } from "@/components/admin/resources/resource-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteResource, toggleResourcePublished } from "@/app/admin/(dashboard)/resources/actions";

type Resource = {
  id: string;
  type: string;
  title: string;
  slug: string;
  image: string;
  published: boolean;
  product: string;
  industry: string;
  extraTags: string[];
  content: string;
};

export function ResourceList({ resources }: { resources: Resource[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Resource | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filters = useMemo(
    () => [
      { id: "all", label: "All", count: resources.length },
      ...RESOURCE_TYPES.map((t) => ({
        id: t.id,
        label: t.label,
        count: resources.filter((r) => r.type === t.id).length,
      })),
    ],
    [resources]
  );

  const filteredResources =
    typeFilter === "all" ? resources : resources.filter((r) => r.type === typeFilter);

  function confirmDelete() {
    if (!toDelete) return;
    const title = toDelete.title;
    startTransition(async () => {
      try {
        await deleteResource(toDelete.id);
        toast.success(`Resource "${title}" deleted`);
      } catch {
        toast.error(`Failed to delete resource "${title}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(resource: Resource, published: boolean) {
    startTransition(async () => {
      try {
        await toggleResourcePublished(resource.id, published);
        toast.success(`Resource ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error("Failed to update resource");
      }
    });
  }

  function typeLabel(type: string) {
    return RESOURCE_TYPES.find((t) => t.id === type)?.label ?? type;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                typeFilter === f.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              <span className="text-[10px] text-muted-foreground">{f.count}</span>
            </button>
          ))}
        </div>

        <ResourceFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Resource
            </Button>
          }
        />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {filteredResources.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No resources yet.</p>
        )}
        {filteredResources.map((resource) => (
          <div key={resource.id} className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {resource.image && (
                <Image
                  src={resource.image}
                  alt={resource.title}
                  width={48}
                  height={48}
                  className="size-full object-cover"
                  unoptimized
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{resource.title}</p>
                <Badge variant="secondary" className="shrink-0">{typeLabel(resource.type)}</Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">/{resource.slug}</p>
            </div>

            <Switch
              checked={resource.published}
              disabled={pending}
              onCheckedChange={(v) => handleTogglePublished(resource, v)}
            />

            <ResourceFormDialog
              resource={resource}
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
              onClick={() => setToDelete(resource)}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete resource"
        description={`Delete "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
