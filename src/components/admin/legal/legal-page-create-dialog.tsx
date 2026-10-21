"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";
import { createLegalPage } from "@/app/admin/(dashboard)/legal/actions";

export function LegalPageCreateDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const slugTouched = useRef(false);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (!slugTouched.current) setSlug(slugify(e.target.value));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    slugTouched.current = true;
    setSlug(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = slug.trim() || slugify(name);
    if (!name.trim() || !key) {
      setError("Name and slug are required");
      return;
    }

    setPending(true);
    setError(undefined);
    try {
      await createLegalPage(key, name.trim());
      toast.success("Legal page created");
      setOpen(false);
      setName("");
      setSlug("");
      slugTouched.current = false;
      router.push(`/admin/legal/${key}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create legal page");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Legal Page</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name">
            <Input value={name} onChange={handleNameChange} placeholder="e.g. Cookie Policy" />
          </Field>
          <Field label="Slug">
            <Input value={slug} onChange={handleSlugChange} placeholder="e.g. cookie-policy" />
          </Field>
          <p className="text-xs text-muted-foreground">
            Shown at <code>/{slug || "..."}</code>. Content is added on the next screen.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
