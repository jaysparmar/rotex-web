"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
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
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type IndustryOption = { id: string; name: string };
type FormValues = {
  enabled: boolean;
  heading: { title: string; subtitle: string };
  industryIds: string[];
};

export function IndustriesForm({
  initialEnabled,
  initialData,
  allIndustries,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string; subtitle: string }; industryIds?: string[] };
  allIndustries: IndustryOption[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      industryIds: initialData.industryIds ?? allIndustries.map((i) => i.id),
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected: string[] = useWatch({ control: form.control, name: "industryIds" }) ?? [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const byId = new Map(allIndustries.map((i) => [i.id, i]));
  const selectedIndustries = selected.map((id) => byId.get(id)).filter((i): i is IndustryOption => Boolean(i));
  const unselectedIndustries = allIndustries.filter((i) => !selected.includes(i.id));

  function add(id: string) {
    form.setValue("industryIds", [...selected, id]);
  }

  function remove(id: string) {
    form.setValue(
      "industryIds",
      selected.filter((v) => v !== id)
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selected.indexOf(active.id as string);
    const newIndex = selected.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    form.setValue("industryIds", arrayMove(selected, oldIndex, newIndex));
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("industries", { enabled, data });
        toast.success("Industries section saved");
      } catch (err) {
        toast.error("Failed to save industries section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Title" {...form.register("heading.title")} />
        <TextAreaField label="Heading Subtitle" {...form.register("heading.subtitle")} />

        {allIndustries.length === 0 ? (
          <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            No industries yet. Add some on the Industries page first.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Shown on homepage — drag to reorder
              </span>
              <div className="rounded-lg border border-border">
                {selectedIndustries.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">None selected yet.</p>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={selected} strategy={verticalListSortingStrategy}>
                      {selectedIndustries.map((industry) => (
                        <IndustryRow key={industry.id} id={industry.id} name={industry.name} onRemove={() => remove(industry.id)} />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {unselectedIndustries.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Not shown</span>
                <div className="rounded-lg border border-border">
                  {unselectedIndustries.map((industry) => (
                    <label
                      key={industry.id}
                      className="flex items-center gap-2.5 border-b border-border p-4 last:border-b-0"
                    >
                      <Checkbox checked={false} onCheckedChange={() => add(industry.id)} />
                      <span className="text-sm font-medium">{industry.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function IndustryRow({ id, name, onRemove }: { id: string; name: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2.5 border-b border-border bg-card p-4 last:border-b-0"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${name}`}
        className="cursor-grab touch-none text-muted-foreground outline-none active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex-1 text-sm font-medium">{name}</span>
      <Checkbox checked onCheckedChange={onRemove} />
    </div>
  );
}
