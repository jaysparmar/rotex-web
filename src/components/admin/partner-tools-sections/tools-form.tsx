"use client";

import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, AddButton } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSaveAction } from "@/hooks/use-save-action";
import { savePartnerToolsSection } from "@/app/admin/(dashboard)/partner-sales-tools/actions";

type Tool = { icon: string; title: string; description: string; link: string };
type ToolInput = { icon: { src: string }; title: string; description: string; link: string };
type FormValues = { enabled: boolean; tools: ToolInput[] };

export function PartnerToolsListForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { tools: Tool[] };
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      tools: initialData.tools.map((t) => ({ ...t, icon: { src: t.icon ?? "" } })),
    },
  });
  const toolsArray = useFieldArray({ control: form.control, name: "tools" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, tools } = values;
    const data = { tools: tools.map((t) => ({ icon: t.icon.src, title: t.title, description: t.description, link: t.link })) };
    run(async () => {
      try {
        await savePartnerToolsSection("tools", { enabled, data });
        toast.success("Tools section saved");
      } catch (err) {
        toast.error("Failed to save Tools section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {toolsArray.fields.map((field, i) => (
              <ToolCard key={field.id} index={i} onRemove={() => toolsArray.remove(i)} />
            ))}
          </div>
          <AddButton
            label="Add Tool"
            onClick={() => toolsArray.append({ icon: { src: "" }, title: "", description: "", link: "" })}
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function ToolCard({ index, onRemove }: { index: number; onRemove: () => void }) {
  const form = useFormContext<FormValues>();

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {form.watch(`tools.${index}.title`) || `Tool ${index + 1}`}
        </span>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
      <MediaField name={`tools.${index}.icon`} mediaType="image" showAlt={false} defaultMode="upload" previewFit="contain" />
      <TextField label="Title" {...form.register(`tools.${index}.title`)} />
      <TextAreaField label="Description" rows={2} {...form.register(`tools.${index}.description`)} />
      <TextField label="Link (opens in new tab)" {...form.register(`tools.${index}.link`)} />
    </div>
  );
}
