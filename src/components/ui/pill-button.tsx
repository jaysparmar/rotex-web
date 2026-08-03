"use client";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  Marketing pill button — the variant set from the Figma "Buttons" sheet.

  tone  = the fill/text pairing (each carries its own hover state)
  size  = padding + type scale; `explore` is the small sentence-case pill
*/
const pillButtonVariants = cva(
  "inline-flex shrink-0 justify-center items-center gap-3.5 rounded-[100px] font-montserrat whitespace-nowrap cursor-pointer transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        /* white fill, dark label → hover flips label + border to orange */
        light:
          "bg-white text-stone-900 outline-1 -outline-offset-1 outline-neutral-200 hover:text-primary hover:outline-primary",
        /* white fill, orange label (the hovered state of `light`, as a resting style) */
        lightOrange:
          "bg-white text-primary outline-1 -outline-offset-1 outline-primary hover:bg-primary hover:text-white",
        /* near-black fill → hover to orange */
        dark: "bg-stone-900 text-white hover:bg-primary",
        /* orange fill → hover to near-black */
        primary: "bg-primary text-white hover:bg-stone-900",
        /* transparent with orange hairline → hover fills orange */
        outline:
          "bg-transparent text-primary outline-1 -outline-offset-1 outline-primary hover:bg-primary hover:text-white",
        /* no chrome — the bare orange text link */
        link: "bg-transparent text-primary hover:text-brand-600",
      },
      size: {
        sm: "px-5 py-3 text-sm font-semibold uppercase leading-5",
        md: "px-6 py-3.5 text-sm font-semibold uppercase leading-5",
        lg: "px-6 py-3.5 text-base font-semibold uppercase leading-6",
        explore: "px-5 py-3 text-base font-medium leading-7 gap-2.5",
      },
    },
    defaultVariants: { tone: "primary", size: "md" },
  }
);

type PillButtonProps = VariantProps<typeof pillButtonVariants> & {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

export function PillButton({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  tone,
  size,
  className,
}: PillButtonProps) {
  const classes = cn(pillButtonVariants({ tone, size }), className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export { pillButtonVariants };
