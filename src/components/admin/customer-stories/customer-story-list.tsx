"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Quote, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { CustomerStoryFormDialog } from "@/components/admin/customer-stories/customer-story-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteCustomerStory, toggleCustomerStoryPublished } from "@/app/admin/(dashboard)/customer-stories/actions";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";

type Story = { id: string; quote: string; author: string; company: string; image: string; mediaType: string; published: boolean };

const PUBLISHED_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Published" },
  { value: "false", label: "Unpublished" },
];

const MEDIA_TYPE_OPTIONS = [
  { value: "", label: "All media" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

export function CustomerStoryList({
  stories,
  total,
  page,
  pageSize,
  q,
  published,
  mediaType,
}: {
  stories: Story[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  published: string;
  mediaType: string;
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Story | null>(null);
  const { pageHref, setParam } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function confirmDelete() {
    if (!toDelete) return;
    const author = toDelete.author;
    startTransition(async () => {
      try {
        await deleteCustomerStory(toDelete.id);
        toast.success(`Story by "${author}" deleted`);
      } catch {
        toast.error(`Failed to delete story by "${author}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(story: Story, published: boolean) {
    startTransition(async () => {
      try {
        await toggleCustomerStoryPublished(story.id, published);
        toast.success(`Story ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error("Failed to update story");
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
              placeholder="Search by author, company, or quote..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            items={MEDIA_TYPE_OPTIONS}
            value={mediaType}
            onValueChange={(v) => setParam("mediaType", v as string)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All media" />
            </SelectTrigger>
            <SelectContent>
              {MEDIA_TYPE_OPTIONS.map((opt) => (
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

        <CustomerStoryFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Story
            </Button>
          }
        />
      </div>

      {stories.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={Quote}
            title={q || published || mediaType ? "No customer stories match your filters" : "No customer stories yet"}
            description={
              q || published || mediaType ? "Try a different search or filter." : "Add a customer story to get started."
            }
          />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {stories.map((story) => (
          <div key={story.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {story.image && story.mediaType === "video" ? (
                <video src={story.image} className="size-full object-cover" muted />
              ) : story.image ? (
                <Image
                  src={story.image}
                  alt={story.author}
                  width={48}
                  height={48}
                  className="size-full object-cover"
                  unoptimized
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{story.author}, {story.company}</p>
              <p className="truncate text-xs text-muted-foreground">{story.quote}</p>
            </div>

            <Switch
              checked={story.published}
              disabled={pending}
              onCheckedChange={(v) => handleTogglePublished(story, v)}
            />

            <CustomerStoryFormDialog
              story={story}
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
              onClick={() => setToDelete(story)}
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
          itemLabel="story"
          itemLabelPlural="stories"
          pageHref={pageHref}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete customer story"
        description={`Delete the story by "${toDelete?.author}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
