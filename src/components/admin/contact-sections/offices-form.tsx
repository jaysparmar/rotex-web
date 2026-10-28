"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveContactSection } from "@/app/admin/(dashboard)/contact/actions";

type Office = { id: string; name: string; address: string; phone: string; email: string };
type Tab = { id: string; label: string; offices: Office[] };
type FormValues = { enabled: boolean; heading: string; description: string; tabs: Tab[] };

function newOffice(): Office {
  return { id: `office-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, name: "", address: "", phone: "", email: "" };
}

function newTab(): Tab {
  return { id: `tab-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, label: "", offices: [] };
}

// dnd-kit's a11y ids come from a module-level counter, not React's SSR-safe
// useId — rendering DndContext during SSR risks a hydration id mismatch, so
// it only mounts client-side (see SortableList for the same pattern).
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function useReorderSensors() {
  return useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
}

function DragHandleRow({ id, dragEnabled, children }: { id: string; dragEnabled: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !dragEnabled,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-start gap-2", isDragging && "relative z-10")}>
      {dragEnabled && (
        <button
          type="button"
          className="mt-4 shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function ContactOfficesForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; description: string; tabs: Tab[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const tabsArray = useFieldArray({ control: form.control, name: "tabs" });
  const { pending, error, success, run } = useSaveAction();
  const mounted = useMounted();
  const sensors = useReorderSensors();

  function handleTabDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = tabsArray.fields.findIndex((f) => f.id === active.id);
    const newIndex = tabsArray.fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) tabsArray.move(oldIndex, newIndex);
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveContactSection("offices", { enabled, data });
        toast.success("Offices section saved");
      } catch (err) {
        toast.error("Failed to save Offices section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <div className="space-y-4">
          {mounted ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTabDragEnd}>
              <SortableContext items={tabsArray.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {tabsArray.fields.map((tabField, tabIndex) => (
                  <DragHandleRow key={tabField.id} id={tabField.id} dragEnabled>
                    <RepeaterItem
                      title={form.watch(`tabs.${tabIndex}.label`) || `Tab ${tabIndex + 1}`}
                      onRemove={() => tabsArray.remove(tabIndex)}
                    >
                      <TextField label="Tab Label" {...form.register(`tabs.${tabIndex}.label`)} />
                      <OfficesRepeater tabIndex={tabIndex} />
                    </RepeaterItem>
                  </DragHandleRow>
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            tabsArray.fields.map((tabField, tabIndex) => (
              <DragHandleRow key={tabField.id} id={tabField.id} dragEnabled={false}>
                <RepeaterItem
                  title={form.watch(`tabs.${tabIndex}.label`) || `Tab ${tabIndex + 1}`}
                  onRemove={() => tabsArray.remove(tabIndex)}
                >
                  <TextField label="Tab Label" {...form.register(`tabs.${tabIndex}.label`)} />
                  <OfficesRepeater tabIndex={tabIndex} />
                </RepeaterItem>
              </DragHandleRow>
            ))
          )}
          <AddButton label="Add Tab" onClick={() => tabsArray.append(newTab())} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function OfficesRepeater({ tabIndex }: { tabIndex: number }) {
  const form = useFormContext<FormValues>();
  const officesArray = useFieldArray({ control: form.control, name: `tabs.${tabIndex}.offices` });
  const mounted = useMounted();
  const sensors = useReorderSensors();

  function handleOfficeDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = officesArray.fields.findIndex((f) => f.id === active.id);
    const newIndex = officesArray.fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) officesArray.move(oldIndex, newIndex);
  }

  function renderOffice(officeField: { id: string }, officeIndex: number) {
    return (
      <div key={officeField.id} className="space-y-3 rounded-lg border border-border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Office {officeIndex + 1}</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => officesArray.remove(officeIndex)}>
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
        <TextField label="Name" {...form.register(`tabs.${tabIndex}.offices.${officeIndex}.name`)} />
        <TextAreaField label="Address" {...form.register(`tabs.${tabIndex}.offices.${officeIndex}.address`)} />
        <FieldGrid>
          <TextField label="Phone" {...form.register(`tabs.${tabIndex}.offices.${officeIndex}.phone`)} />
          <TextField label="Email" {...form.register(`tabs.${tabIndex}.offices.${officeIndex}.email`)} />
        </FieldGrid>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Offices</span>
      {mounted ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOfficeDragEnd}>
          <SortableContext items={officesArray.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {officesArray.fields.map((officeField, officeIndex) => (
              <DragHandleRow key={officeField.id} id={officeField.id} dragEnabled>
                {renderOffice(officeField, officeIndex)}
              </DragHandleRow>
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        officesArray.fields.map((officeField, officeIndex) => (
          <DragHandleRow key={officeField.id} id={officeField.id} dragEnabled={false}>
            {renderOffice(officeField, officeIndex)}
          </DragHandleRow>
        ))
      )}
      <AddButton label="Add Office" onClick={() => officesArray.append(newOffice())} />
    </div>
  );
}
