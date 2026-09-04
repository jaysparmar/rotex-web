"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { CustomerStoryFormDialog } from "@/components/admin/customer-stories/customer-story-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteCustomerStory, toggleCustomerStoryPublished } from "@/app/admin/(dashboard)/customer-stories/actions";

type Story = { id: string; quote: string; author: string; company: string; image: string; mediaType: string; published: boolean };

export function CustomerStoryList({
  stories,
  total,
  page,
  pageSize,
}: {
  stories: Story[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Story | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    return `${pathname}?${params.toString()}`;
  }

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
      <div className="flex justify-end">
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
          <EmptyState icon={Quote} title="No customer stories yet" description="Add a customer story to get started." />
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
