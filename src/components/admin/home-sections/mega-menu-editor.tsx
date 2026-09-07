"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Field, TextField, TextAreaField, RepeaterItem, FieldGrid } from "@/components/admin/form-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlatImageField } from "@/components/admin/flat-image-field";
import { ChevronUp, ChevronDown } from "lucide-react";

type IndustryOption = { id: string; name: string; subIndustries: { id: string; name: string }[] };
type BlogOption = { slug: string; title: string };

type Mode = "none" | "industries" | "products" | "custom" | "legacy";

const MODE_LABELS: Record<Exclude<Mode, "legacy">, string> = {
  none: "None",
  industries: "Industries (live data)",
  products: "Product Categories (live data)",
  custom: "Custom",
};

function getMode(megaMenu: { type?: string } | null | undefined, megaMenuSource: { type?: string } | null | undefined): Mode {
  if (megaMenuSource?.type === "industries") return "industries";
  if (megaMenuSource?.type === "products") return "products";
  if (megaMenu?.type === "flat") return "custom";
  if (megaMenu) return "legacy";
  return "none";
}

export function MegaMenuEditor({
  navIndex,
  industries,
  productCategories,
  blogs,
}: {
  navIndex: number;
  industries: IndustryOption[];
  productCategories: string[];
  blogs: BlogOption[];
}) {
  const form = useFormContext();
  const menuPath = `header.nav.${navIndex}.megaMenu`;
  const sourcePath = `header.nav.${navIndex}.megaMenuSource`;
  const megaMenu = useWatch({ control: form.control, name: menuPath });
  const megaMenuSource = useWatch({ control: form.control, name: sourcePath });
  const mode = getMode(megaMenu, megaMenuSource);

  function setMode(newMode: Mode) {
    if (newMode === "none") {
      form.setValue(menuPath, null);
      form.setValue(sourcePath, null);
    } else if (newMode === "industries") {
      form.setValue(menuPath, null);
      form.setValue(sourcePath, { type: "industries", selectedIds: [] });
    } else if (newMode === "products") {
      form.setValue(menuPath, null);
      form.setValue(sourcePath, { type: "products", selectedIds: [], cta: { text: "", href: "" } });
    } else {
      form.setValue(sourcePath, null);
      form.setValue(menuPath, { type: "flat", columns: [], image: "", imageCaption: "" });
    }
  }

  return (
    <div className="space-y-4 border-t border-border pt-4">
      {mode === "legacy" ? (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          This menu is code-managed and not editable here. Choose another option below to replace it.
        </p>
      ) : null}
      <Field label="Mega Menu">
        <Select
          items={MODE_LABELS}
          value={mode === "legacy" ? "none" : mode}
          onValueChange={(v) => setMode(v as Mode)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {mode === "industries" && <IndustriesPicker navIndex={navIndex} industries={industries} />}
      {mode === "products" && <ProductsPicker navIndex={navIndex} categories={productCategories} />}
      {mode === "custom" && <CustomMenuEditor navIndex={navIndex} blogs={blogs} />}
    </div>
  );
}

// ─── Industries / Products checkbox pickers ────────────────────────────────

function IndustriesPicker({ navIndex, industries }: { navIndex: number; industries: IndustryOption[] }) {
  const form = useFormContext();
  const base = `header.nav.${navIndex}.megaMenuSource`;
  const selected: string[] = useWatch({ control: form.control, name: `${base}.selectedIds` }) ?? [];

  function toggle(id: string, checked: boolean) {
    const current: string[] = form.getValues(`${base}.selectedIds`) ?? [];
    form.setValue(`${base}.selectedIds`, checked ? [...current, id] : current.filter((v) => v !== id));
  }

  function toggleIndustry(industry: IndustryOption, checked: boolean) {
    const current: string[] = form.getValues(`${base}.selectedIds`) ?? [];
    const subIds = industry.subIndustries.map((s) => s.id);
    if (checked) {
      form.setValue(`${base}.selectedIds`, [...new Set([...current, industry.id])]);
    } else {
      form.setValue(
        `${base}.selectedIds`,
        current.filter((v) => v !== industry.id && !subIds.includes(v))
      );
    }
  }

  // Reorder just the industry-level entries within selectedIds — this is what controls
  // the mega menu's display order, since the site sorts groups by position in selectedIds.
  function moveIndustry(industryId: string, direction: -1 | 1) {
    const current: string[] = form.getValues(`${base}.selectedIds`) ?? [];
    const positions: number[] = [];
    current.forEach((id, i) => {
      if (industries.some((ind) => ind.id === id)) positions.push(i);
    });
    const idsAtPositions = positions.map((i) => current[i]);
    const idx = idsAtPositions.indexOf(industryId);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= idsAtPositions.length) return;
    [idsAtPositions[idx], idsAtPositions[swapWith]] = [idsAtPositions[swapWith], idsAtPositions[idx]];
    const next = [...current];
    positions.forEach((pos, i) => {
      next[pos] = idsAtPositions[i];
    });
    form.setValue(`${base}.selectedIds`, next);
  }

  // Show checked industries first, in their configured order, then unchecked ones.
  const orderedIndustries = [...industries].sort((a, b) => {
    const aChecked = selected.includes(a.id);
    const bChecked = selected.includes(b.id);
    if (aChecked && bChecked) return selected.indexOf(a.id) - selected.indexOf(b.id);
    if (aChecked) return -1;
    if (bChecked) return 1;
    return 0;
  });
  const checkedIndustryIds = orderedIndustries.filter((i) => selected.includes(i.id)).map((i) => i.id);

  return (
    <div className="space-y-1 rounded-lg border border-border">
      {industries.length === 0 && (
        <p className="p-4 text-sm text-muted-foreground">No industries yet. Add some on the Industries page first.</p>
      )}
      {orderedIndustries.map((industry) => {
        const industryChecked = selected.includes(industry.id);
        const orderIdx = checkedIndustryIds.indexOf(industry.id);
        return (
          <div key={industry.id} className="border-b border-border p-4 last:border-b-0">
            <div className="flex items-center gap-2.5">
              <label className="flex flex-1 items-center gap-2.5">
                <Checkbox
                  checked={industryChecked}
                  onCheckedChange={(checked) => toggleIndustry(industry, checked === true)}
                />
                <span className="text-sm font-medium">{industry.name}</span>
              </label>
              {industryChecked && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={orderIdx === 0}
                    onClick={() => moveIndustry(industry.id, -1)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={orderIdx === checkedIndustryIds.length - 1}
                    onClick={() => moveIndustry(industry.id, 1)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
            {industryChecked && industry.subIndustries.length > 0 && (
              <div className="mt-2 ml-6 space-y-1.5">
                {industry.subIndustries.map((sub) => (
                  <label key={sub.id} className="flex items-center gap-2.5">
                    <Checkbox
                      checked={selected.includes(sub.id)}
                      onCheckedChange={(checked) => toggle(sub.id, checked === true)}
                    />
                    <span className="text-sm text-muted-foreground">{sub.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProductsPicker({ navIndex, categories }: { navIndex: number; categories: string[] }) {
  const form = useFormContext();
  const base = `header.nav.${navIndex}.megaMenuSource`;
  const selected: string[] = useWatch({ control: form.control, name: `${base}.selectedIds` }) ?? [];

  function toggle(category: string, checked: boolean) {
    const current: string[] = form.getValues(`${base}.selectedIds`) ?? [];
    form.setValue(`${base}.selectedIds`, checked ? [...current, category] : current.filter((v) => v !== category));
  }

  return (
    <div className="space-y-4">
      <FieldGrid>
        <TextField label="CTA Text" {...form.register(`${base}.cta.text`)} />
        <TextField label="CTA Href" {...form.register(`${base}.cta.href`)} />
      </FieldGrid>
      <div className="space-y-1 rounded-lg border border-border">
        {categories.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No product categories yet.</p>
        )}
        {categories.map((category) => (
          <label key={category} className="flex items-center gap-2.5 border-b border-border p-4 last:border-b-0">
            <Checkbox
              checked={selected.includes(category)}
              onCheckedChange={(checked) => toggle(category, checked === true)}
            />
            <span className="text-sm font-medium">{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Custom flat menu editor (About Us / Stay Informed / Join Us style) ───
// Each column holds exactly one card (heading + description + image), matching
// how these menus are laid out. Hrefs stay fixed to the pages already coded.

function CustomMenuEditor({ navIndex, blogs }: { navIndex: number; blogs: BlogOption[] }) {
  const form = useFormContext();
  const base = `header.nav.${navIndex}.megaMenu`;
  const columns = useFieldArray({ control: form.control, name: `${base}.columns` });
  const featuredBlogSlug: string | undefined = useWatch({ control: form.control, name: `${base}.featuredBlogSlug` });

  return (
    <div className="space-y-4">
      <Field label="Featured Blog">
        <Select
          items={[{ value: "__none__", label: "None" }, ...blogs.map((b) => ({ value: b.slug, label: b.title }))]}
          value={featuredBlogSlug || "__none__"}
          onValueChange={(v) => form.setValue(`${base}.featuredBlogSlug`, v === "__none__" ? undefined : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {blogs.map((b) => (
              <SelectItem key={b.slug} value={b.slug}>
                {b.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1.5 text-xs text-muted-foreground">
          When set, the default image/caption below is replaced by this blog&apos;s image + title, and it links to
          the blog post.
        </p>
      </Field>
      <p className="text-xs text-muted-foreground">
        Default image shows whenever a card below doesn&apos;t have its own image set (or as a fallback if no
        Featured Blog is picked above).
      </p>
      <FlatImageField name={`${base}.image`} label="Default Image" />
      <TextField label="Default Image Caption" {...form.register(`${base}.imageCaption`)} />

      <div className="space-y-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cards</span>
        {columns.fields.length === 0 && (
          <p className="text-sm text-muted-foreground">No cards. This menu has no content configured in code.</p>
        )}
        {columns.fields.map((field, i) => (
          <CustomMenuCard key={field.id} base={base} columnIndex={i} onRemove={() => columns.remove(i)} />
        ))}
      </div>
    </div>
  );
}

function CustomMenuCard({
  base,
  columnIndex,
  onRemove,
}: {
  base: string;
  columnIndex: number;
  onRemove: () => void;
}) {
  const form = useFormContext();
  const groupPath = `${base}.columns.${columnIndex}.groups.0`;
  const heading = useWatch({ control: form.control, name: `${groupPath}.heading` });

  return (
    <RepeaterItem title={heading || `Card ${columnIndex + 1}`} onRemove={onRemove}>
      <TextField label="Heading" {...form.register(`${groupPath}.heading`)} />
      <TextAreaField label="Description" rows={2} {...form.register(`${groupPath}.description`)} />
      <TextField
        label="Href (fixed — tied to the site's pages)"
        readOnly
        className="cursor-not-allowed bg-muted text-muted-foreground"
        {...form.register(`${groupPath}.href`)}
      />
      <FlatImageField name={`${groupPath}.image`} label="Card Image (optional)" />
    </RepeaterItem>
  );
}

