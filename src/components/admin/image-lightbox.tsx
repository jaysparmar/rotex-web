"use client";

import { useState } from "react";
import Image from "next/image";
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
        <DialogContent className="max-w-2xl bg-transparent p-0 shadow-none ring-0 sm:max-w-2xl">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <Image src={src} alt={alt} fill className="object-contain p-8" unoptimized />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
