"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DownloadsFilterFieldProps = {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const ALL = "All";

export function DownloadsFilterField({ label, placeholder, options, value, onChange }: DownloadsFilterFieldProps) {
  return (
    <div className="self-stretch flex flex-col gap-2.5">
      <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase leading-5">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v ?? ALL)}>
        <SelectTrigger className="w-full h-auto px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline-1 -outline-offset-1 outline-gray-200 text-sm font-medium font-montserrat text-neutral-400">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
