export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export type TocEntry = { text: string; id: string };

export function extractToc(html: string): TocEntry[] {
  const matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gis)];
  return matches.map((m) => {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    return { text, id: slugifyHeading(text) };
  });
}
