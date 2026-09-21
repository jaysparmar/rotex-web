// Shared by every `contains`-based search query. A plain substring match never
// equates "and" with "&" (e.g. Industry name "Oil & Gas" vs a typed "oil and
// gas"), so this expands one term into every spelling worth trying, and each
// call site ORs a `contains` check across all of them.
export function buildSearchOr(term: string): string[] {
  const variants = new Set([term]);
  if (/\s&\s/.test(term)) variants.add(term.replace(/\s&\s/g, " and "));
  if (/\sand\s/i.test(term)) variants.add(term.replace(/\sand\s/gi, " & "));
  return [...variants];
}
