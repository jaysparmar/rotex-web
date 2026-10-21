"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

const PARTNERS_PAGE_SIZE = 8;

type Partner = { id: string; name: string; logo: string };
type FormValues = {
  enabled: boolean;
  heading: string;
  paragraphs: { text: string }[];
  stats: { value: string; label: string }[];
  trustedLabel: string;
  partnerIds: string[];
  video: { src: string };
  videoEnabled: boolean;
};

export function StoryForm({
  initialEnabled,
  initialData,
  allPartners,
}: {
  initialEnabled: boolean;
  initialData: {
    heading: string;
    paragraphs: string[];
    stats: { value: string; label: string }[];
    trustedLabel: string;
    partnerIds: string[];
    videoSrc: string;
    videoEnabled?: boolean;
  };
  allPartners: Partner[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      paragraphs: initialData.paragraphs.map((text) => ({ text })),
      stats: initialData.stats,
      trustedLabel: initialData.trustedLabel,
      partnerIds: initialData.partnerIds ?? [],
      video: { src: initialData.videoSrc },
      videoEnabled: initialData.videoEnabled ?? true,
    },
  });
  const paragraphArray = useFieldArray({ control: form.control, name: "paragraphs" });
  const statsArray = useFieldArray({ control: form.control, name: "stats" });
  const { pending, error, success, run } = useSaveAction();
  const selectedPartners = form.watch("partnerIds");
  const videoEnabled = form.watch("videoEnabled");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerPage, setPartnerPage] = useState(1);
  const filteredPartners = allPartners.filter((p) =>
    p.name.toLowerCase().includes(partnerSearch.trim().toLowerCase())
  );
  const partnerTotalPages = Math.max(1, Math.ceil(filteredPartners.length / PARTNERS_PAGE_SIZE));
  const currentPartnerPage = Math.min(partnerPage, partnerTotalPages);
  const pagedPartners = filteredPartners.slice(
    (currentPartnerPage - 1) * PARTNERS_PAGE_SIZE,
    currentPartnerPage * PARTNERS_PAGE_SIZE
  );

  function handlePartnerSearch(value: string) {
    setPartnerSearch(value);
    setPartnerPage(1);
  }

  function togglePartner(id: string, checked: boolean) {
    const current = form.getValues("partnerIds");
    form.setValue("partnerIds", checked ? [...current, id] : current.filter((p) => p !== id));
  }

  function onSubmit(values: FormValues) {
    const { enabled, paragraphs, video, ...rest } = values;
    const data = { ...rest, paragraphs: paragraphs.map((p) => p.text), videoSrc: video.src };
    run(async () => {
      try {
        await saveAboutSection("story", { enabled, data });
        toast.success("Story section saved");
      } catch (err) {
        toast.error("Failed to save story section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paragraphs</span>
          {paragraphArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Paragraph ${i + 1}`} onRemove={() => paragraphArray.remove(i)}>
              <TextAreaField label="Text" {...form.register(`paragraphs.${i}.text`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Paragraph" onClick={() => paragraphArray.append({ text: "" })} />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stats</span>
          {statsArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Stat ${i + 1}`} onRemove={() => statsArray.remove(i)}>
              <FieldGrid>
                <TextField label="Value" {...form.register(`stats.${i}.value`)} />
                <TextField label="Label" {...form.register(`stats.${i}.label`)} />
              </FieldGrid>
            </RepeaterItem>
          ))}
          <AddButton label="Add Stat" onClick={() => statsArray.append({ value: "", label: "" })} />
        </div>

        <TextField label="Trusted Label" {...form.register("trustedLabel")} />

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Show Video</p>
            <p className="text-xs text-muted-foreground">
              Turn off to hide the video on the public site, even if a media src is set below.
            </p>
          </div>
          <Switch
            checked={videoEnabled}
            onCheckedChange={(v) => form.setValue("videoEnabled", v)}
          />
        </div>
        <MediaField name="video" mediaType="video" showAlt={false} />

        <div className="space-y-1 rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Trusted Partner Logos
          </span>
          <div className="px-3 pb-3">
            <TextField
              label="Search Partners"
              placeholder="Search by name..."
              value={partnerSearch}
              onChange={(e) => handlePartnerSearch(e.target.value)}
            />
          </div>
          {allPartners.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published partners yet. Add some on the Partners page first.
            </p>
          )}
          {allPartners.length > 0 && filteredPartners.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No partners match &quot;{partnerSearch}&quot;.</p>
          )}
          {pagedPartners.map((partner) => (
            <div key={partner.id} className="flex items-center gap-4 border-t border-border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {partner.logo && (
                  <Image src={partner.logo} alt={partner.name} width={40} height={40} className="size-full object-contain" unoptimized />
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{partner.name}</span>
              <Switch
                checked={selectedPartners.includes(partner.id)}
                onCheckedChange={(v) => togglePartner(partner.id, v)}
              />
            </div>
          ))}
          {filteredPartners.length > 0 && (
            <div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground">
              <span>
                {filteredPartners.length} partner{filteredPartners.length === 1 ? "" : "s"} · Page{" "}
                {currentPartnerPage} of {partnerTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPartnerPage <= 1}
                  onClick={() => setPartnerPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPartnerPage >= partnerTotalPages}
                  onClick={() => setPartnerPage((p) => Math.min(partnerTotalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
