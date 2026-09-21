/** Fixed taxonomy for tagging + filtering blogs, news updates, and case
 * studies. Deliberately a small curated set (not derived from the live
 * Product/Category/Industry tables, which are for the actual product
 * catalog) — keeps the filter UI clean instead of surfacing every ad-hoc
 * tag anyone typed into a free-text field. */
export const RESOURCE_PRODUCT_CATEGORIES = [
  "Solenoid Valve",
  "Angle Seat Valve",
  "Actuators",
  "Positioners",
  "Automotive Solutions",
] as const;

export const RESOURCE_INDUSTRIES = [
  "Oil & Gas",
  "Power",
  "Process",
  "Rail",
  "Machine Solution",
  "Aerospace & Defense",
  "Automotive",
] as const;
