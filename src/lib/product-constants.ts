export const PRODUCT_TYPES = [
  { value: "simple", label: "Simple" },
  { value: "variable", label: "Variable" },
] as const;

export const PRODUCT_ATTRIBUTES = [
  { key: "size", label: "Size" },
  { key: "variantType", label: "Variant Type" },
  { key: "orifice", label: "Orifice" },
  { key: "minOperatingTemp", label: "Min. Operating Temperature" },
  { key: "maxOperatingTemp", label: "Max. Operating Temperature" },
  { key: "flowFactor", label: "Flow Factor" },
  { key: "power", label: "Power" },
] as const;

export type ProductAttributeKey = (typeof PRODUCT_ATTRIBUTES)[number]["key"];
