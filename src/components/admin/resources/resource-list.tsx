"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { RESOURCE_TYPES } from "@/components/admin/resources/resource-edit-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteResource, toggleResourcePublished } from "@/app/admin/(dashboard)/resources/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

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

const PUBLISHED_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Published" },
  { value: "false", label: "Unpublished" },
];

export function ResourceList({
  resources,
  total,
  page,
  pageSize,
  q,
  published,
  type,
  totalByType,
  totalAll,
}: {
  resources: Resource[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  published: string;
  type: string;
  totalByType: Record<string, number>;
  totalAll: number;
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Resource | null>(null);
  const { pageHref, setParam } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tabs = [
    { id: "all", label: "All", count: totalAll },
    ...RESOURCE_TYPES.map((t) => ({ id: t.id, label: t.label, count: totalByType[t.id] ?? 0 })),
  ];

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

  function typeLabel(t: string) {
    return RESOURCE_TYPES.find((rt) => rt.id === t)?.label ?? t;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={type} onValueChange={(v) => setParam("type", v === "all" ? undefined : (v as string))}>
          <TabsList className="h-auto flex-wrap">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
                {t.label}
                <span className="text-[10px] opacity-70">{t.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Link href={type === "all" ? "/admin/resources/new" : `/admin/resources/new?type=${type}`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            Add Resource
          </Button>
        </Link>
      </div>

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
        <Select items={PUBLISHED_OPTIONS} value={published} onValueChange={(v) => setParam("published", v as string)}>
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

      {resources.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={BookOpen}
            title={q || published ? "No resources match your filters" : "No resources yet"}
            description={q || published ? "Try a different search or filter." : "Add a resource to get started."}
          />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {resources.map((resource) => (
            <div key={resource.id} className="flex flex-wrap items-center gap-4 p-4">
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

              <Link href={`/admin/resources/${resource.id}`}>
                <Button variant="ghost" size="icon-sm">
                  <Pencil className="size-3.5" />
                </Button>
              </Link>

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
      )}

      {total > 0 && (
        <AdminPagination page={page} totalPages={totalPages} total={total} itemLabel="resource" pageHref={pageHref} />
      )}

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
