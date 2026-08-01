export const ENQUIRY_TYPE_OPTIONS = [
  "General Enquiry",
  "Request a Quote",
  "Technical Support",
  "Become a Channel Partner",
  "Become a Supplier",
  "Careers",
];

export const PRODUCT_TYPE_OPTIONS = [
  "Solenoid Valves",
  "Control Valves",
  "Actuators",
  "Pneumatic Valves",
  "Process Automation Systems",
  "Other",
];

export const COUNTRY_OPTIONS = ["United States", "India", "UAE", "Saudi Arabia", "United Kingdom", "Germany"];

export const CITY_OPTIONS = ["Mumbai", "Delhi", "Dubai", "London", "Berlin", "New York"];

export const INDUSTRY_OPTIONS = ["Oil & Gas", "Chemical", "Power", "Mining", "Industrial Automation", "Pharmaceuticals"];

export type ContactOffice = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
};

export type ContactOfficeTab = {
  id: string;
  label: string;
  offices: ContactOffice[];
};

export const CONTACT_OFFICE_TABS: ContactOfficeTab[] = [
  {
    id: "sales",
    label: "Sales Office",
    offices: [
      {
        id: "sales-hq",
        name: "Rotex Group Sales Headquarters",
        address: "703, Western Edge II, Off. Western Express Highway, Borivali (East), Mumbai – 400 066, Maharashtra, India.",
        phone: "+91 22 4211 1444",
        email: "enq@rotexautomation.com",
      },
      {
        id: "sales-delhi",
        name: "Rotex North India Sales Office",
        address: "Plot 14, Sector 6, IMT Manesar, Gurugram – 122051, Haryana, India.",
        phone: "+91 124 456 7890",
        email: "sales.north@rotexautomation.com",
      },
    ],
  },
  {
    id: "manufacturing",
    label: "Manufacturing Units",
    offices: [
      {
        id: "mfg-plant1",
        name: "Rotex Manufacturing Plant I",
        address: "Plot No. 12/2, Village Kachigam, Nani Daman, Daman – 396210, India.",
        phone: "+91 260 225 5000",
        email: "manufacturing@rotexautomation.com",
      },
    ],
  },
  {
    id: "product-enquiry",
    label: "Product Enquiry Contacts",
    offices: [
      {
        id: "pe-valves",
        name: "Solenoid & Control Valves Desk",
        address: "703, Western Edge II, Off. Western Express Highway, Borivali (East), Mumbai – 400 066, Maharashtra, India.",
        phone: "+91 22 4211 1455",
        email: "valves@rotexautomation.com",
      },
    ],
  },
  {
    id: "global",
    label: "Global Offices",
    offices: [
      {
        id: "global-uae",
        name: "Rotex Automation FZE",
        address: "Jebel Ali Free Zone, Dubai, United Arab Emirates.",
        phone: "+971 4 881 5599",
        email: "uae@rotexautomation.com",
      },
      {
        id: "global-us",
        name: "Rotex Automation Inc.",
        address: "1200 Corporate Drive, Suite 200, Houston, TX 77043, USA.",
        phone: "+1 713 555 0142",
        email: "usa@rotexautomation.com",
      },
    ],
  },
];
