// Client-safe: no prisma import. The DB-backed getter lives in form-config.ts.

export type FormFieldKey =
  | "fullName"
  | "companyName"
  | "phone"
  | "email"
  | "country"
  | "city"
  | "industry"
  | "enquiryType"
  | "productType"
  | "quantity"
  | "message"
  | "uploadFile";

/** Order matches how fields render top-to-bottom on every common form. */
export const FORM_FIELDS: { key: FormFieldKey; label: string; locked?: boolean }[] = [
  { key: "fullName", label: "Full Name", locked: true },
  { key: "companyName", label: "Company Name" },
  { key: "phone", label: "Phone Number", locked: true },
  { key: "email", label: "Email", locked: true },
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
  { key: "industry", label: "Industry Served" },
  { key: "enquiryType", label: "Enquiry Type" },
  { key: "productType", label: "Product Type" },
  { key: "quantity", label: "Quantity" },
  { key: "message", label: "Message", locked: true },
  { key: "uploadFile", label: "Upload File" },
];

export type FormKey = "contact" | "industry" | "product-quote" | "supplier" | "channel-partner";

export const FORMS: { key: FormKey; label: string; path: string }[] = [
  { key: "contact", label: "Contact Form", path: "/contact" },
  { key: "industry", label: "Industry Enquiry Form", path: "/industries/[sector]" },
  { key: "product-quote", label: "Product Quote Form", path: "/product/[slug]" },
  { key: "supplier", label: "Supplier Application Form", path: "/join/supplier" },
  { key: "channel-partner", label: "Channel Partner Application Form", path: "/join/channel-partner" },
];

/** Fixed — not admin-editable. Every common form's "Product Type" field uses this list. */
export const PRODUCT_TYPE_OPTIONS = [
  "Solenoid Valves",
  "Angle Seat Valves",
  "Actuators",
  "Positioners",
  "Automotive Solutions",
  "CTIS",
] as const;

/** Fixed — not admin-editable. Only Contact and Industry forms have an Enquiry Type
 * option set; other forms don't render the field even if the toggle is on. */
export const ENQUIRY_TYPE_OPTIONS_BY_FORM: Partial<Record<FormKey, readonly string[]>> = {
  contact: [
    "Product Enquiry",
    "General Enquiry",
    "Request a Quote",
    "Product Support",
    "Technical Support",
    "Became a Channel Partner",
    "Become a Supplier",
    "Careers",
  ],
  industry: [
    "Product Enquiry",
    "General Enquiry",
    "Product Support",
    "Technical Support",
    "Became a Channel Partner",
    "Become a Supplier",
  ],
};

// Mirrors current live behavior per form, before any admin edits. Empty
// industryIds means nothing is picked yet — the dropdown shows no options until some are.
export const DEFAULT_FORM_CONFIG: PrismaJson.FormConfigData = {
  contact: {
    industryIds: [],
    fields: {
      fullName: true, companyName: true, phone: true, email: true, country: true, city: true,
      industry: true, enquiryType: true, productType: true, quantity: false, message: true, uploadFile: false,
    },
  },
  industry: {
    industryIds: [],
    fields: {
      fullName: true, companyName: true, phone: true, email: true, country: true, city: true,
      industry: false, enquiryType: true, productType: true, quantity: false, message: true, uploadFile: true,
    },
  },
  "product-quote": {
    industryIds: [],
    fields: {
      fullName: true, companyName: true, phone: true, email: true, country: true, city: true,
      industry: true, enquiryType: false, productType: false, quantity: true, message: true, uploadFile: false,
    },
  },
  supplier: {
    industryIds: [],
    fields: {
      fullName: true, companyName: true, phone: true, email: true, country: true, city: true,
      industry: true, enquiryType: false, productType: true, quantity: false, message: true, uploadFile: false,
    },
  },
  "channel-partner": {
    industryIds: [],
    fields: {
      fullName: true, companyName: true, phone: true, email: true, country: true, city: true,
      industry: true, enquiryType: false, productType: true, quantity: false, message: true, uploadFile: false,
    },
  },
};
