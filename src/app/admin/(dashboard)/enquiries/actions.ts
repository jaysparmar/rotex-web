"use server";

import { prisma } from "@/lib/prisma";
import { buildEnquiryWhere } from "@/lib/enquiry-filters";

const CSV_COLUMNS = [
  "Date",
  "Name",
  "Type",
  "Industry",
  "Product",
  "Phone",
  "Email",
  "City",
  "Country",
  "Company",
  "Designation",
  "Quantity",
  "Message",
  "Attachments",
] as const;

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsvRow(values: string[]): string {
  return values.map(csvEscape).join(",");
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "enquiries";
}

/** Exports one or more enquiry tabs as CSV. A multi-tab export gets a leading "Tab" column. */
export async function exportEnquiriesCsv(tabs: string[]): Promise<{ filename: string; csv: string }> {
  if (tabs.length === 0) throw new Error("Select at least one tab to export.");

  const industries = await prisma.industry.findMany({ select: { name: true } });
  const industryNames = industries.map((i) => i.name);
  const multi = tabs.length > 1;

  const columns = multi ? ["Tab", ...CSV_COLUMNS] : [...CSV_COLUMNS];
  const rows: string[] = [toCsvRow(columns)];

  for (const tab of tabs) {
    const where = buildEnquiryWhere(tab, industryNames);
    const enquiries = await prisma.enquiry.findMany({ where, orderBy: { createdAt: "desc" } });

    for (const e of enquiries) {
      const fileUrls = (e.fileUrls as string[]) ?? [];
      const values = [
        new Date(e.createdAt).toLocaleDateString("en-GB", { timeZone: "UTC" }),
        e.fullName,
        e.enquiryType,
        e.industryName,
        e.product,
        e.phone,
        e.email,
        e.city,
        e.country,
        e.company ?? "",
        e.designation ?? "",
        e.quantity ?? "",
        e.message,
        fileUrls.join(" | "),
      ];
      rows.push(toCsvRow(multi ? [tab, ...values] : values));
    }
  }

  const filename =
    tabs.length === 1
      ? `${slugify(tabs[0])}-enquiries.csv`
      : `enquiries-${tabs.map(slugify).join("_").slice(0, 80)}.csv`;

  return { filename, csv: rows.join("\r\n") };
}
