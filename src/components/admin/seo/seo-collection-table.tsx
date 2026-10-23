"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowUpRight, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from "@/components/ui/table";

export type SeoCollectionRow = { key: string; label: string; sub?: string; path: string; configured: boolean };

export function SeoCollectionTable({
  collectionLabel,
  itemNoun,
  rows,
}: {
  collectionLabel: string;
  itemNoun: string;
  rows: SeoCollectionRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.label.toLowerCase().includes(q) || r.sub?.toLowerCase().includes(q));
  }, [rows, query]);

  const configuredCount = rows.filter((r) => r.configured).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${collectionLabel.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {configuredCount} of {rows.length} {rows.length === 1 ? itemNoun.toLowerCase() : `${itemNoun.toLowerCase()}s`}{" "}
          configured
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">{itemNoun}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableEmpty colSpan={3}>
              {rows.length === 0 ? `No ${collectionLabel.toLowerCase()} yet.` : "No matches."}
            </TableEmpty>
          )}
          {filtered.map((item) => (
            <TableRow
              key={item.key}
              hoverable
              className="cursor-pointer"
              onClick={() => router.push(`/admin/seo/${item.key}`)}
            >
              <TableCell className="pl-4">
                <p className="font-medium">{item.label}</p>
                {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
              </TableCell>
              <TableCell>
                {item.configured ? (
                  <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not set
                  </Badge>
                )}
              </TableCell>
              <TableCell className="pr-4">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={item.path} target="_blank" title="View on site" />}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/admin/seo/${item.key}`} title="Edit SEO" />}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
