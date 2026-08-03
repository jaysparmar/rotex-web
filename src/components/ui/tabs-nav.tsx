"use client";
import { cn } from "@/lib/utils";

export type Tab = { id: string; label: string };

type TabsNavProps = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export function TabsNav({ tabs, active, onChange, className }: TabsNavProps) {
  return (
    <div className={cn("border-b border-stone-300", className)}>
      <div className="flex items-center justify-between lg:justify-start gap-0 lg:gap-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "p-2.5 lg:py-5 text-sm lg:text-lg font-montserrat font-semibold leading-5 lg:leading-6 border-b-2 -mb-px transition-colors duration-150 whitespace-nowrap",
              tab.id === active
                ? "border-red-600 text-red-600"
                : "border-transparent text-stone-900 hover:text-red-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
