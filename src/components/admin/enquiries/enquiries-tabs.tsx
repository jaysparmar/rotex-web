"use client";

import { Mail, Phone, MapPin, Building2, FileText, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { OTHER_TAB, NO_PRODUCT_PLACEHOLDER } from "@/lib/enquiry-filters";

const ALL_PRODUCTS = "__all__";

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
  fileUrls: string[];
  createdAt: Date;
};

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

      {e.fileUrls.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {e.fileUrls.map((url, i) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
              {e.fileUrls.length > 1 ? `Attachment ${i + 1}` : "View attached file"}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function EnquiriesTabs({
  tabs,
  tabCounts,
  active,
  enquiries,
  total,
  page,
  pageSize,
  product,
  productNames,
}: {
  tabs: string[];
  tabCounts: Record<string, number>;
  active: string;
  enquiries: Enquiry[];
  total: number;
  page: number;
  pageSize: number;
  product: string;
  productNames: string[];
}) {
  const { searchParams, pathname, router, pageHref, setParam } = useAdminListUrl();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function changeTab(name: string) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", name);
    params.delete("product");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((name) => (
          <button
            key={name}
            onClick={() => changeTab(name)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active === name
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {name}
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">{tabCounts[name] ?? 0}</span>
          </button>
        ))}
      </div>

      {productNames.length > 0 && (
        <Select
          value={product || ALL_PRODUCTS}
          onValueChange={(v) => setParam("product", v === ALL_PRODUCTS ? undefined : (v as string))}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PRODUCTS}>All products</SelectItem>
            {productNames.map((p) => (
              <SelectItem key={p} value={p as string}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {enquiries.length === 0 ? (
        <p className="rounded-lg border border-border py-8 text-center text-sm text-muted-foreground">
          No enquiries here yet.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {enquiries.map((e) => (
            <EnquiryCard key={e.id} enquiry={e} tab={active} />
          ))}
        </div>
      )}

      {total > 0 && (
        <AdminPagination page={page} totalPages={totalPages} total={total} itemLabel="enquiry" itemLabelPlural="enquiries" pageHref={pageHref} />
      )}
    </div>
  );
}
