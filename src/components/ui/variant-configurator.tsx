"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { VARIANT_AXES, type ProductVariant, type VariantAxisKey } from "@/lib/product-detail-data";

type Selection = Record<VariantAxisKey, string>;

function matches(variant: ProductVariant, selection: Partial<Selection>) {
  return VARIANT_AXES.every(({ key }) => {
    const want = selection[key];
    return want === undefined || variant[key] === want;
  });
}

export function VariantConfigurator({
  variants,
  onVariantChange,
  onRequestQuote,
}: {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant) => void;
  onRequestQuote: () => void;
}) {
  // Only axes the user has explicitly picked are hard constraints; everything
  // else is derived from whichever variant currently resolves, so unrelated
  // (or dependent) axes never falsely lock out options on other axes.
  const [selection, setSelection] = useState<Partial<Selection>>({});

  const resolved = useMemo(
    () => variants.find((v) => matches(v, selection)) ?? variants[0],
    [variants, selection]
  );

  useEffect(() => {
    if (resolved) onVariantChange(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);

  const effective: Selection = useMemo(
    () =>
      VARIANT_AXES.reduce((acc, { key }) => {
        acc[key] = selection[key] ?? resolved[key];
        return acc;
      }, {} as Selection),
    [selection, resolved]
  );

  const handleSelect = (key: VariantAxisKey, value: string) => {
    const next: Partial<Selection> = { [key]: value };

    // Keep every other pinned axis whose value is still reachable together
    // with the new pick; drop (un-pin) any that's no longer available.
    for (const axis of VARIANT_AXES) {
      if (axis.key === key) continue;
      const oldVal = selection[axis.key];
      if (oldVal === undefined) continue;
      const candidate = { ...next, [axis.key]: oldVal };
      if (variants.some((v) => matches(v, candidate))) {
        next[axis.key] = oldVal;
      }
    }

    setSelection(next);
  };

  const optionsByAxis = useMemo(() => {
    const map: Record<VariantAxisKey, string[]> = {} as Record<VariantAxisKey, string[]>;
    for (const { key } of VARIANT_AXES) {
      map[key] = Array.from(new Set(variants.map((v) => v[key])));
    }
    return map;
  }, [variants]);

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="py-5 border-b border-neutral-200 flex items-center justify-center">
        <p className="flex-1 text-neutral-400 text-sm font-bold font-montserrat uppercase leading-5 tracking-wide">
          Product Variations
        </p>
      </div>

      <div className="flex flex-col gap-7">
        {VARIANT_AXES.map(({ key, label }) => {
          const options = optionsByAxis[key];
          if (options.length === 0) return null;

          return (
            <div key={key} className="flex flex-col gap-3">
              <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
                {label}
              </p>
              <div className="flex flex-wrap gap-3">
                {options.map((opt) => {
                  const isSelected = effective[key] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelect(key, opt)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium font-montserrat leading-4 transition-colors duration-200",
                        isSelected
                          ? "bg-zinc-800 text-white"
                          : "ring-1 ring-inset ring-neutral-200 text-stone-900 hover:bg-stone-50"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onRequestQuote}
        className="w-fit px-6 py-3.5 bg-orange-600 hover:bg-orange-700 rounded-full flex justify-center items-center gap-3.5 transition-colors"
      >
        <span className="text-center text-white text-sm font-semibold font-montserrat uppercase leading-5">
          Request Quote for This Variant
        </span>
      </button>
    </div>
  );
}
