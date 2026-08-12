"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export type StoryPickerItem = {
  id: string;
  quote: string;
  author: string;
  company: string;
  image: string;
  mediaType?: string;
};

export function StoryPickerList({
  stories,
  selectedIds,
  onToggle,
  emptyMessage,
}: {
  stories: StoryPickerItem[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  emptyMessage: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = stories.filter((story) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      story.author.toLowerCase().includes(q) ||
      story.company.toLowerCase().includes(q) ||
      story.quote.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
      </div>
      <Input
        type="text"
        placeholder="Search by name, company, or quote..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-border">
        {stories.length === 0 && <p className="p-4 text-sm text-muted-foreground">{emptyMessage}</p>}
        {stories.length > 0 && filtered.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No stories match your search.</p>
        )}
        {filtered.map((story) => (
          <div key={story.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {story.image && story.mediaType === "video" ? (
                <video src={story.image} className="size-full object-cover" muted />
              ) : story.image ? (
                <Image
                  src={story.image}
                  alt={story.author}
                  width={40}
                  height={40}
                  className="size-full object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {story.author}, {story.company}
              </p>
              <p className="truncate text-xs text-muted-foreground">{story.quote}</p>
            </div>
            <Switch checked={selectedIds.includes(story.id)} onCheckedChange={(v) => onToggle(story.id, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}
