"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ImageLightboxTrigger({
  src,
  alt,
  className,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!src) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("cursor-zoom-in", className)}
        aria-label={`Preview ${alt}`}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-auto max-w-[calc(100%-2rem)] bg-transparent p-0 shadow-none ring-0 sm:max-w-[calc(100%-2rem)]">
          <div className="flex size-[min(80vw,80vh,480px)] items-center justify-center rounded-xl bg-card p-8 ring-1 ring-foreground/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Muted, controls-less preview thumbnail as the trigger — click opens a modal with the
 * real, controllable, autoplaying video. Mirrors ImageLightboxTrigger's click-to-preview
 * pattern for video sources. */
export function VideoLightboxTrigger({
  src,
  className,
  children,
}: {
  src: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!src) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("cursor-zoom-in", className)}
        aria-label="Play video"
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-auto max-w-[calc(100%-2rem)] bg-transparent p-0 shadow-none ring-0 sm:max-w-[calc(100%-2rem)]">
          <div className="flex max-h-[80vh] w-[min(80vw,960px)] items-center justify-center rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            {open && <video src={src} controls autoPlay className="max-h-[75vh] max-w-full rounded-lg" />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
