"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CustomerStoryFormDialog } from "@/components/admin/customer-stories/customer-story-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCustomerStory, toggleCustomerStoryPublished } from "@/app/admin/(dashboard)/customer-stories/actions";

type Story = { id: string; quote: string; author: string; company: string; image: string; mediaType: string; published: boolean };

export function CustomerStoryList({ stories }: { stories: Story[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Story | null>(null);

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

      <div className="divide-y divide-border rounded-lg border border-border">
        {stories.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No customer stories yet.</p>
        )}
        {stories.map((story) => (
          <div key={story.id} className="flex items-center gap-4 p-4">
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
