/** Splits an Industry/Sub-Industry cell's comma-separated reference codes into clean tokens. */
export function splitReferences(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
