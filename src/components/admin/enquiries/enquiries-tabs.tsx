"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Building2, FileText, Calendar } from "lucide-react";

type Industry = { id: string; name: string };
type Enquiry = {
  id: string;
  source: string;
  industryName: string;
  fullName: string;
  enquiryType: string;
  product: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  company: string | null;
  designation: string | null;
  message: string;
  fileUrl: string | null;
  createdAt: Date;
};

const SUPPLIER_TAB = "Supplier Applications";
const OTHER_TAB = "Other";

// The Supplier form reuses this table but has no real "product" — it sends
// this literal placeholder to satisfy the NOT NULL column. Hide it in the UI.
const NO_PRODUCT_PLACEHOLDER = "Supplier Application";

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EnquiryCard({ enquiry, tab }: { enquiry: Enquiry; tab: string }) {
  const e = enquiry;
  const isSupplier = e.source === "supplier";
  const product = !isSupplier && e.product && e.product !== NO_PRODUCT_PLACEHOLDER ? e.product : null;
  const typeLabel = isSupplier ? `${e.enquiryType} (Supplier)` : e.enquiryType;

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{e.fullName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {typeLabel}
            </span>
            {tab === OTHER_TAB && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {e.industryName}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          {new Date(e.createdAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}
        </div>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        <DetailRow icon={Mail} label="Email" value={e.email} />
        <DetailRow icon={Phone} label="Phone" value={e.phone} />
        <DetailRow icon={MapPin} label="Location" value={[e.city, e.country].filter(Boolean).join(", ")} />
        <DetailRow icon={Building2} label="Company" value={e.company} />
        <DetailRow icon={FileText} label="Product" value={product} />
        <DetailRow icon={FileText} label="Designation" value={e.designation} />
        {isSupplier && <DetailRow icon={Building2} label="Industries Served" value={e.industryName} />}
      </div>

      {e.message && (
        <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">{e.message}</p>
      )}

      {e.fileUrl && (
        <a href={e.fileUrl} target="_blank" rel="noreferrer" className="inline-block text-sm text-primary hover:underline">
          View attached file
        </a>
      )}
    </div>
  );
}

export function EnquiriesTabs({ industries, enquiries }: { industries: Industry[]; enquiries: Enquiry[] }) {
  const industryNames = industries.map((i) => i.name);

  // Supplier applications get their own tab — they were never "about" an
  // industry, the form just repurposes the same table/columns.
  const supplierEnquiries = enquiries.filter((e) => e.source === "supplier");
  const nonSupplier = enquiries.filter((e) => e.source !== "supplier");
  const otherEnquiries = nonSupplier.filter((e) => !industryNames.includes(e.industryName));

  const tabs = [
    ...industryNames,
    ...(supplierEnquiries.length > 0 ? [SUPPLIER_TAB] : []),
    ...(otherEnquiries.length > 0 ? [OTHER_TAB] : []),
  ];

  const [active, setActive] = useState(tabs[0] ?? "");

  function enquiriesForTab(name: string) {
    if (name === SUPPLIER_TAB) return supplierEnquiries;
    if (name === OTHER_TAB) return otherEnquiries;
    return nonSupplier.filter((e) => e.industryName === name);
  }

  const filtered = enquiriesForTab(active);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((name) => (
          <button
            key={name}
            onClick={() => setActive(name)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active === name
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {name}
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">{enquiriesForTab(name).length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-border py-8 text-center text-sm text-muted-foreground">
          No enquiries here yet.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((e) => (
            <EnquiryCard key={e.id} enquiry={e} tab={active} />
          ))}
        </div>
      )}
    </div>
  );
}
