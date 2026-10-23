"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";
import { SEO_COLLECTIONS } from "@/lib/seo-collections-config";

export function SeoCollectionSelect({ value }: { value: string }) {
  const { setParam } = useAdminListUrl();

  return (
    <Select value={value} onValueChange={(v) => setParam("collection", v === "static" ? undefined : String(v))}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Static Pages" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="static">Static Pages</SelectItem>
        {SEO_COLLECTIONS.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
