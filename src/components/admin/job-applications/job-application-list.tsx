"use client";

import { FileText, Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/admin/empty-state";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { useDebouncedUrlSearch } from "@/hooks/use-debounced-url-search";
import {
  FILTER_KEYS,
  type JobApplicationFilterParams,
} from "@/lib/job-application-filters";

type JobApplication = {
  id: string;
  fullName: string;
  position: string;
  experience: string;
  location: string;
  phone: string;
  email: string;
  expectedSalary: string | null;
  noticePeriod: string | null;
  message: string;
  resumeUrl: string | null;
  createdAt: Date;
};

export function JobApplicationList({
  applications,
  total,
  page,
  pageSize,
  q,
  filters,
  positions,
  locations,
}: {
  applications: JobApplication[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  filters: JobApplicationFilterParams;
  positions: string[];
  locations: string[];
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const { pageHref, setParam } = useAdminListUrl();
  const { search, onSearchChange } = useDebouncedUrlSearch(q);
  const hasFilters = q || FILTER_KEYS.some((k) => filters[k]);

  const positionOptions = [
    { value: "", label: "All positions" },
    ...positions.map((p) => ({ value: p, label: p })),
  ];
  const locationOptions = [
    { value: "", label: "All locations" },
    ...locations.map((l) => ({ value: l, label: l })),
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        items={positionOptions}
        value={filters.position ?? ""}
        onValueChange={(v) => setParam("position", v as string)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All positions" />
        </SelectTrigger>
        <SelectContent>
          {positionOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        items={locationOptions}
        value={filters.location ?? ""}
        onValueChange={(v) => setParam("location", v as string)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All locations" />
        </SelectTrigger>
        <SelectContent>
          {locationOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (applications.length === 0) {
    return (
      <div className="space-y-4">
        {toolbar}
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={FileText}
            title={
              hasFilters
                ? "No applications match your filters"
                : "No applications yet"
            }
            description={
              hasFilters
                ? "Try a different search or filter."
                : "Applications submitted through the Career page form will show up here."
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toolbar}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Expected Salary</TableHead>
            <TableHead>Notice Period</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead className="pr-5">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((a) => (
            <TableRow key={a.id} hoverable>
              <TableCell className="pl-5 font-medium whitespace-nowrap">
                {a.fullName}
              </TableCell>
              <TableCell className="whitespace-nowrap">{a.position}</TableCell>
              <TableCell className="whitespace-nowrap">
                {a.experience}
              </TableCell>
              <TableCell className="whitespace-nowrap">{a.location}</TableCell>
              <TableCell className="whitespace-nowrap">{a.phone}</TableCell>
              <TableCell className="whitespace-nowrap">{a.email}</TableCell>
              <TableCell className="whitespace-nowrap">
                {a.expectedSalary ?? "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {a.noticePeriod ?? "—"}
              </TableCell>
              <TableCell className="max-w-64 truncate" title={a.message}>
                {a.message}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {a.resumeUrl ? (
                  <a
                    href={a.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    View
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="pr-5 whitespace-nowrap text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {total > 0 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          itemLabel="application"
          pageHref={pageHref}
        />
      )}
    </div>
  );
}
