"use client";
import { useRef } from "react";
import { HONEYPOT_FIELD, RENDERED_AT_FIELD } from "@/lib/spam-protection-fields";

/** Drop inside every public `<form>` that POSTs to an enquiry-style API
 * route. Renders a field real users never see or fill (any bot that
 * auto-fills every input on the page fills it too) plus a hidden mount
 * timestamp the server uses to reject submissions that arrive faster than a
 * human could plausibly fill the form. */
export function HoneypotFields() {
  const renderedAt = useRef(Date.now());
  return (
    <>
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />
      <input type="hidden" name={RENDERED_AT_FIELD} value={renderedAt.current} />
    </>
  );
}
