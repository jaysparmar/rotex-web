"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HexIcon } from "@/components/ui/hex-icon";
import { cn } from "@/lib/utils";

type ValueItem = { title: string; description: string };

type AboutValuesSectionProps = {
  heading?: string;
  subheading?: string;
  values?: ValueItem[];
};

const defaultValues: ValueItem[] = [
  {
    title: "Engineer the root. Not the symptom.",
    description:
      "When a valve fails repeatedly, most manufacturers improve the replacement process. We investigate why it failed and eliminate the failure mode permanently. 73% of solenoid valve failures trace to one root cause — contamination from conventional spool designs. We replaced the spool.",
  },
  {
    title: "The specification is the floor, not the ceiling.",
    description:
      "Meeting the printed spec is the minimum bar, not the target. We engineer margin into every component so it keeps performing long after the datasheet numbers are tested.",
  },
  {
    title: "Every application is unique. Every solution should be.",
    description:
      "No two installations face identical pressure, temperature, or contamination profiles. We configure every solution around the operating conditions it will actually face — not a generic default.",
  },
  {
    title: "Speed without compromise is an engineering achievement, not a shortcut.",
    description: "We move fast without cutting corners on quality or safety.",
  },
  {
    title: "Global trust is earned one installation at a time.",
    description: "Every deployment, in every country, upholds the same engineering standard.",
  },
];

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative shrink-0 size-6" aria-hidden="true">
      <span className="absolute left-1 top-1/2 w-4 -translate-y-1/2 border-t-[1.5px] border-stone-900" />
      {!open && (
        <span className="absolute top-1 left-1/2 h-4 -translate-x-1/2 border-l-[1.5px] border-stone-900" />
      )}
    </span>
  );
}

export function AboutValuesSection({
  heading = "Built Beyond Standards",
  subheading = "The values behind our engineering, speed, and global trust.",
  values = defaultValues,
}: AboutValuesSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">

        {/* Heading */}
        <div className="lg:w-96 lg:shrink-0">
          <div className="lg:sticky lg:top-32">
            <h2 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
              {heading}
            </h2>
            <p className="mt-2 lg:mt-3 text-stone-500 lg:text-stone-900 font-montserrat font-medium text-sm lg:text-base leading-5 lg:leading-6">
              {subheading}
            </p>
          </div>
        </div>

        {/* Values accordion — one item open at a time. Figma: 630px wide */}
        <div className="flex-1 lg:max-w-157.5 flex flex-col">
          {values.map((v, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="border-b border-stone-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="w-full py-3 lg:py-5 flex items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HexIcon size={14} />
                    <span
                      className={cn(
                        "font-montserrat font-medium text-base lg:text-lg leading-6",
                        isOpen ? "text-red-600" : "text-stone-900"
                      )}
                    >
                      {v.title}
                    </span>
                  </span>
                  <ToggleIcon open={isOpen} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-stone-500 font-montserrat font-medium text-sm leading-5">
                        {v.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
