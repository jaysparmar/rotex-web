"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type PickerItem = { id: string; label: string; meta?: string };

/** Reusable "pick some, drag to order" list: a draggable "Selected" panel (shown in
 * this order on the site) and an "Available" panel below to add more. Only safe when
 * `selected` holds exactly these items' ids — not a mix with some other id space. */
export function OrderedCheckboxPicker({
  items,
  selected,
  onChange,
  emptyMessage = "Nothing available yet.",
  renderSelectedExtra,
}: {
  items: PickerItem[];
  selected: string[];
  onChange: (ids: string[]) => void;
  emptyMessage?: string;
  renderSelectedExtra?: (id: string) => React.ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const byId = new Map(items.map((i) => [i.id, i]));
  const selectedItems = selected.map((id) => byId.get(id)).filter((i): i is PickerItem => Boolean(i));
  const unselectedItems = items.filter((i) => !selected.includes(i.id));

  function add(id: string) {
    onChange([...selected, id]);
  }

  function remove(id: string) {
    onChange(selected.filter((v) => v !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selected.indexOf(active.id as string);
    const newIndex = selected.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(selected, oldIndex, newIndex));
  }

  if (items.length === 0) {
    return <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Selected — drag to reorder
        </span>
        <div className="rounded-lg border border-border">
          {selectedItems.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">None selected yet.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selected} strategy={verticalListSortingStrategy}>
                {selectedItems.map((item) => (
                  <PickerRow key={item.id} item={item} onRemove={() => remove(item.id)} extra={renderSelectedExtra?.(item.id)} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {unselectedItems.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available</span>
          <div className="rounded-lg border border-border">
            {unselectedItems.map((item) => (
              <label key={item.id} className="flex items-center gap-2.5 border-b border-border p-4 last:border-b-0">
                <Checkbox checked={false} onCheckedChange={() => add(item.id)} />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.meta && <span className="text-xs text-muted-foreground">{item.meta}</span>}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PickerRow({ item, onRemove, extra }: { item: PickerItem; onRemove: () => void; extra?: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="border-b border-border bg-card last:border-b-0">
      <div className="flex items-center gap-2.5 p-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${item.label}`}
          className="cursor-grab touch-none text-muted-foreground outline-none active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <span className="flex-1 text-sm font-medium">{item.label}</span>
        {item.meta && <span className="text-xs text-muted-foreground">{item.meta}</span>}
        <Checkbox checked onCheckedChange={onRemove} />
      </div>
      {extra}
    </div>
  );
}
