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
