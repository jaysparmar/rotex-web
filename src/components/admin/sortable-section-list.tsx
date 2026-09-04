"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SectionRow } from "@/components/admin/section-row";
import { Button } from "@/components/ui/button";
import { reorderHomeSections, toggleHomeSectionEnabled } from "@/app/admin/(dashboard)/home/actions";

type Section = { key: string; enabled: boolean };

export function SortableSectionList({ sections }: { sections: Section[] }) {
  const [items, setItems] = useState(sections);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const isDirty = items.some((s, i) => s.key !== sections[i].key);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSaved(false);
    setItems((current) => {
      const oldIndex = current.findIndex((s) => s.key === active.id);
      const newIndex = current.findIndex((s) => s.key === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  }

  function handleSave() {
    startTransition(async () => {
      await reorderHomeSections(items.map((s) => s.key));
      setSaved(true);
    });
  }

  function handleReset() {
    setItems(sections);
    setSaved(false);
  }

  function handleToggle(key: string, enabled: boolean) {
    setItems((current) => current.map((s) => (s.key === key ? { ...s, enabled } : s)));
    const label = key.replace("-", " ");
    startTransition(async () => {
      try {
        await toggleHomeSectionEnabled(key, enabled);
        toast.success(`${label} ${enabled ? "enabled" : "disabled"}`);
      } catch {
        setItems((current) => current.map((s) => (s.key === key ? { ...s, enabled: !enabled } : s)));
        toast.error(`Failed to update ${label}`);
      }
    });
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-border">
            {items.map((section) => (
              <SectionRow
                key={section.key}
                sectionKey={section.key}
                enabled={section.enabled}
                onToggle={(enabled) => handleToggle(section.key, enabled)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isDirty && (
        <div className="flex items-center gap-3 border-t border-border p-4">
          <Button size="sm" onClick={handleSave} disabled={pending}>
            {pending ? "Saving..." : "Save Order"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset} disabled={pending}>
            Reset Order
          </Button>
          {saved && <span className="text-sm text-success">Saved.</span>}
        </div>
      )}
    </div>
  );
}
