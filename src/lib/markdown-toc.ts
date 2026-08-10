export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export type TocEntry = { text: string; id: string };

export function extractToc(markdown: string): TocEntry[] {
  const matches = [...markdown.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((m) => ({ text: m[1].trim(), id: slugifyHeading(m[1].trim()) }));
}
