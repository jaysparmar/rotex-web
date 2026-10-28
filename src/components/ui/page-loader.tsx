"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function PageLoader({
  logo,
}: {
  logo: { src: string; alt: string };
}) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const hide = () => {
      setFading(true);
      setTimeout(() => setVisible(false), 500);
    };

    if (document.readyState === "complete") {
      // Already loaded — still show briefly so the logo registers
      const t = setTimeout(hide, 600);
      return () => clearTimeout(t);
    }

    window.addEventListener("load", hide);
    return () => window.removeEventListener("load", hide);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0000] transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center">
        {/* Spinning gradient ring */}
        <span className="absolute h-48 w-48 rounded-full border-4 border-transparent animate-spin [border-top-color:#ff9a00] [border-right-color:#EF3E23]" />
        <span className="absolute h-42 w-42 rounded-full border-2 border-transparent animate-[spin_2s_linear_infinite_reverse] [border-bottom-color:#c31d00] [border-left-color:#950000] opacity-60" />

        {/* Logo container */}
        <div className="relative z-10 flex h-30 w-30 items-center justify-center rounded-full bg-black/60 p-5 backdrop-blur-sm">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={108}
            height={60}
            unoptimized
            className="w-auto h-16 object-contain"
            priority
          />
        </div>
      </div>

      {/* Brand pulse bar */}
      <div className="mt-14 h-1 w-48 overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#ff9a00] via-[#EF3E23] to-[#950000] animate-[loader-bar_1.4s_ease-in-out_infinite]" />
      </div>

      <p className="mt-5 text-sm font-semibold tracking-[0.25em] text-neutral-500 uppercase">
        Loading
      </p>

      <style>{`
        @keyframes loader-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
