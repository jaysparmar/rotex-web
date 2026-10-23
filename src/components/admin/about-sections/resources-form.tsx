"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

const MAX_RESOURCES = 3;
const PAGE_SIZE = 10;

type Resource = { id: string; type: string; title: string; slug: string; image: string };
type Tab = { id: string; label: string; cta: { label: string; href: string }; resourceIds: string[]; enabled: boolean };
type FormValues = { enabled: boolean; heading: { title: string }; tabs: Tab[] };

// Every resource type is always available as a tab — admin chooses which ones
// are actually live via the per-tab Enabled toggle (stored tabs were created
// before "csr" existed, so it's backfilled below rather than being in the DB).
const RESOURCE_TYPE_TABS: { id: string; label: string; cta: { label: string; href: string } }[] = [
  { id: "blogs", label: "Blogs", cta: { label: "Read All Blogs", href: "/blogs" } },
  { id: "case-studies", label: "Case Studies", cta: { label: "Read All Case Studies", href: "/case-studies" } },
  { id: "news", label: "News & Updates", cta: { label: "View All News & Updates", href: "/news-updates" } },
  { id: "csr", label: "CSR", cta: { label: "View All CSR", href: "/csr" } },
];

function withAllResourceTypes(tabs: Tab[]): Tab[] {
  const byId = new Map(tabs.map((t) => [t.id, t]));
  return RESOURCE_TYPE_TABS.map((defaults) => {
    const stored = byId.get(defaults.id);
    return {
      id: defaults.id,
      label: stored?.label ?? defaults.label,
      cta: stored?.cta ?? defaults.cta,
      resourceIds: stored?.resourceIds ?? [],
      // Tabs saved before this toggle existed had no `enabled` field — treat them as on.
      enabled: stored?.enabled ?? Boolean(stored),
    };
  });
}

export function ResourcesForm({
  initialEnabled,
  initialData,
  allResources,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string }; tabs: Tab[] };
  allResources: Resource[];
}) {
  const normalizedTabs = withAllResourceTypes(initialData.tabs);
  const form = useForm<FormValues>({
    defaultValues: { enabled: initialEnabled, heading: initialData.heading, tabs: normalizedTabs },
  });
  const { fields } = useFieldArray({ control: form.control, name: "tabs" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("resources", { enabled, data });
        toast.success("Resources section saved");
      } catch (err) {
        toast.error("Failed to save Resources section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Title" {...form.register("heading.title")} />

        <div className="space-y-6">
          {fields.map((field, i) => {
            const tabEnabled = Boolean(form.watch(`tabs.${i}.enabled`));
            return (
              <div key={field.id} className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold">{form.watch(`tabs.${i}.label`)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Enabled</span>
                    <Switch
                      checked={tabEnabled}
                      onCheckedChange={(v) => form.setValue(`tabs.${i}.enabled`, v)}
                    />
                  </div>
                </div>

                {tabEnabled && (
                  <>
                    <FieldGrid>
                      <TextField label="Tab Label" {...form.register(`tabs.${i}.label`)} />
                      <TextField label="CTA Label" {...form.register(`tabs.${i}.cta.label`)} />
                    </FieldGrid>
                    <TextField label="CTA Href" {...form.register(`tabs.${i}.cta.href`)} />

                    <ResourcePicker
                      tabIndex={i}
                      typeId={normalizedTabs[i].id}
                      options={allResources.filter((r) => r.type === normalizedTabs[i].id)}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function ResourceRow({ resource }: { resource: Resource }) {
  return (
    <>
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
        {resource.image && (
          <Image src={resource.image} alt={resource.title} width={40} height={40} className="size-full object-cover" unoptimized />
        )}
      </div>
      <span className="flex-1 truncate text-sm font-medium">{resource.title}</span>
    </>
  );
}

// The public site always shows exactly MAX_RESOURCES cards per tab, so the
// picker enforces that cap up front — flipping a switch on past the cap is
// blocked rather than silently bumping an older pick off the list. One
// searchable, paginated list (PAGE_SIZE at a time) with a switch per resource,
// so its height stays constant no matter how many resources exist.
function ResourcePicker({ tabIndex, typeId, options }: { tabIndex: number; typeId: string; options: Resource[] }) {
  const form = useFormContext<FormValues>();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const selectedIds: string[] = form.watch(`tabs.${tabIndex}.resourceIds`) ?? [];

  const atLimit = selectedIds.length >= MAX_RESOURCES;
  const trimmedQuery = query.trim().toLowerCase();
  const filtered = options.filter((r) => !trimmedQuery || r.title.toLowerCase().includes(trimmedQuery));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(0);
  }

  function toggle(id: string, checked: boolean) {
    if (checked) {
      if (atLimit) return;
      form.setValue(`tabs.${tabIndex}.resourceIds`, [...selectedIds, id]);
    } else {
      form.setValue(
        `tabs.${tabIndex}.resourceIds`,
        selectedIds.filter((r) => r !== id)
      );
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{typeId.replace("-", " ")}</span>
        <span className="text-xs text-muted-foreground">
          {selectedIds.length}/{MAX_RESOURCES} selected
        </span>
      </div>

      {options.length === 0 ? (
        <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          No published resources of this type yet. Add some on the Resources page first.
        </p>
      ) : (
        <div className="space-y-2">
          <Input
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={atLimit ? `Max ${MAX_RESOURCES} enabled — disable one to enable another` : "Search..."}
          />

          {pageItems.length > 0 ? (
            <div className="rounded-lg border border-border">
              {pageItems.map((resource) => {
                const checked = selectedIds.includes(resource.id);
                return (
                  <div key={resource.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
                    <ResourceRow resource={resource} />
                    <Switch checked={checked} disabled={!checked && atLimit} onCheckedChange={(v) => toggle(resource.id, v)} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">No matches.</p>
          )}

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filtered.length} total · Page {currentPage + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
