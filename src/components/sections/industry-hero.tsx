"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  name: string;
  description: string;
  bg: StaticImageData | string;
};

export function IndustryHero({ name, description, bg }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* ── MOBILE: image on top, full text below (no overlay, no clamp) ── */}
      <div className="lg:hidden">
        <div className="relative w-full aspect-4/3 overflow-hidden">
          <Image src={bg} alt={name} fill className="object-cover object-center" />
        </div>
        <div className="bg-black px-4 py-8 flex flex-col gap-2.5">
          <h2 className="text-white text-2xl font-medium font-montserrat leading-8">{name}</h2>
          <p className="text-subtext text-sm font-medium font-montserrat leading-5">{description}</p>
        </div>
      </div>

      {/* ── DESKTOP: image with overlay text, clamped + Read more modal ── */}
      {/* Figma: 640px */}
      <div className="hidden lg:block relative w-full min-h-160 overflow-hidden">
        <Image src={bg} alt={name} fill className="object-cover object-center" />
        {/* Bottom-up scrim — dark at the bottom where the name and copy sit,
            clearing to the image up top. */}
        <div className="absolute inset-0 bg-linear-0 from-black/90 to-black/0" />
        <div className="relative min-h-160 flex items-end">
          <div className="container pt-16 pb-10 flex items-end justify-between gap-8">
            <h2 className="text-white text-4xl font-medium font-montserrat leading-10">{name}</h2>
            <div className="max-w-131 flex flex-col gap-1.5">
              <p className="text-subtext text-base font-medium font-montserrat leading-6 line-clamp-3">
                {description}
              </p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="self-start text-subtext text-base font-medium font-montserrat leading-6 underline underline-offset-2 hover:text-white transition-colors duration-150"
              >
                Read more
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
