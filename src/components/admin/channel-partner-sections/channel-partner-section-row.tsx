"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { toggleChannelPartnerSectionEnabled } from "@/app/admin/(dashboard)/channel-partner/actions";

export function ChannelPartnerSectionRow({
  sectionKey,
  label,
  enabled,
}: {
  sectionKey: string;
  label: string;
  enabled: boolean;
}) {
  const [checked, setChecked] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function onToggle(value: boolean) {
    setChecked(value);
    startTransition(() => toggleChannelPartnerSectionEnabled(sectionKey, value));
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <Switch checked={checked} onCheckedChange={onToggle} disabled={pending} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Link href={`/admin/channel-partner/${sectionKey}`}>
        <Button variant="ghost" size="sm" className="gap-1">
          Edit
          <ChevronRight className="size-3.5" />
        </Button>
      </Link>
    </div>
  );
}
