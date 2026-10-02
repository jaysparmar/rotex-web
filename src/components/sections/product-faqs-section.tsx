"use client";

import DOMPurify from "isomorphic-dompurify";
import { Collapsible } from "@base-ui/react/collapsible";
import { HexIcon } from "@/components/ui/hex-icon";
import { toRichHtml } from "@/lib/rich-text";
import richContentStyles from "@/components/sections/rich-content.module.css";

function FaqCard({ faq }: { faq: PrismaJson.CategoryFaqs[number] }) {
  return (
    <Collapsible.Root
      defaultOpen
      className="relative w-full bg-white rounded-lg p-5 outline outline-1 -outline-offset-1 outline-neutral-200 overflow-hidden"
    >
      <div className="flex flex-col gap-2.5 pr-8">
        <h3 className="text-stone-900 font-medium font-montserrat text-xl leading-7">{faq.question}</h3>
        <Collapsible.Panel className="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-300 ease-in-out data-starting-style:h-0 data-ending-style:h-0">
          <div
            className={`text-stone-500 text-sm font-medium font-montserrat leading-5 ${richContentStyles.content}`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(toRichHtml(faq.answer)) }}
          />
        </Collapsible.Panel>
      </div>
      <Collapsible.Trigger
        aria-label="Toggle answer"
        className="absolute top-3 right-3 cursor-pointer transition-transform duration-300 data-panel-open:rotate-45"
      >
        <HexIcon size={14} />
      </Collapsible.Trigger>
    </Collapsible.Root>
  );
}

export function ProductFaqsSection({ faqs }: { faqs: PrismaJson.CategoryFaqs }) {
  if (faqs.length === 0) return null;

  return (
    <div className="container py-8 sm:py-12">
      <h2 className="text-stone-900 text-xl sm:text-2xl font-semibold font-montserrat leading-7 mb-4">
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <FaqCard key={i} faq={faq} />
        ))}
      </div>
    </div>
  );
}
