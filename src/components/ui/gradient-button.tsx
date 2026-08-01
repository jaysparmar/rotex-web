"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

/*
  Gradient button — exact Figma spec:
  px-6 py-3
  bg-radial-[at_45%_-21%] from-amber-500 via-orange-600 28% to-black 87%
  rounded-[57px]
  inline-flex justify-center items-center gap-2.5
  text-white text-base font-medium font-['Montserrat']
*/

type GradientButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function GradientButton({
  children,
  href,
  onClick,
  className,
}: GradientButtonProps) {
  const baseClass = cn(
    "gradient-btn px-6 py-3 rounded-[57px] inline-flex justify-center items-center gap-2.5",
    "text-white text-base font-medium font-[var(--font-montserrat)] whitespace-nowrap",
    "cursor-pointer",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClass}>
      {children}
    </button>
  );
}
