import { marked } from "marked";

export function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function toRichHtml(value: string): string {
  return value && !looksLikeHtml(value) ? (marked.parse(value, { async: false }) as string) : value;
}
