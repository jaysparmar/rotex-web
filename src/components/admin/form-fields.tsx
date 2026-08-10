import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function TextField(props: React.ComponentProps<typeof Input> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <Field label={label}>
      <Input {...rest} className="h-9" />
    </Field>
  );
}

export function TextAreaField(props: React.ComponentProps<typeof Textarea> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <Field label={label}>
      <Textarea {...rest} rows={rest.rows ?? 3} />
    </Field>
  );
}

/**
 * Styled dropdown that still accepts a react-hook-form `register()` spread
 * (name/onChange/onBlur/ref) — Select's onValueChange is bridged into a
 * minimal synthetic event `{ target: { name, value } }` so RHF's onChange,
 * which only reads target.name/target.value, works unmodified. Also accepts
 * plain `value`/`onChange(value)` for manual Controller-driven usage.
 */
export function SelectField({
  label,
  options,
  className,
  placeholder,
  ...rest
}: React.ComponentProps<"select"> & {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const { name, value, defaultValue, disabled, onChange } = rest;
  return (
    <Field label={label}>
      <Select
        value={value as string | undefined}
        defaultValue={defaultValue as string | undefined}
        disabled={disabled}
        onValueChange={(v) =>
          onChange?.({ target: { name, value: (v as string) ?? "" } } as unknown as React.ChangeEvent<HTMLSelectElement>)
        }
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function SwitchField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function RepeaterItem({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
      {children}
    </div>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} className="gap-1.5">
      <Plus className="size-3.5" />
      {label}
    </Button>
  );
}
