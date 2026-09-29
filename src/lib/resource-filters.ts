/** A resource matches an industry filter if it's tagged with that industry directly,
 * or with any of its sub-industries — picking "Oil & Gas" also surfaces resources
 * tagged only with e.g. "Refining". */
export function matchesIndustryFilter(
  industryIds: string[],
  filterIndustryId: string,
  subIndustryParentMap: Map<string, string>
): boolean {
  if (industryIds.includes(filterIndustryId)) return true;
  return industryIds.some((id) => subIndustryParentMap.get(id) === filterIndustryId);
}

export function matchesProductFilter(productIds: string[], filterProductId: string): boolean {
  return productIds.includes(filterProductId);
}
