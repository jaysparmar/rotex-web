import { DollarSign, Building2, GraduationCap, Plane, Heart, Clock, Users, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const PERK_ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "dollar-sign", label: "Dollar Sign (pay)", Icon: DollarSign },
  { key: "building", label: "Building (health/office)", Icon: Building2 },
  { key: "graduation-cap", label: "Graduation Cap (L&D)", Icon: GraduationCap },
  { key: "plane", label: "Plane (travel)", Icon: Plane },
  { key: "heart", label: "Heart (wellness)", Icon: Heart },
  { key: "clock", label: "Clock (flexibility)", Icon: Clock },
  { key: "users", label: "Users (team)", Icon: Users },
  { key: "award", label: "Award (recognition)", Icon: Award },
];

const PERK_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  PERK_ICON_OPTIONS.map((o) => [o.key, o.Icon])
);

/** Mounted once so every PerkIcon's `url(#perk-icon-gradient)` stroke can resolve. */
export function PerkIconGradientDefs() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="perk-icon-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF9A00" />
          <stop offset="0.28" stopColor="#F03900" />
          <stop offset="0.61" stopColor="#950000" />
          <stop offset="0.87" stopColor="#000000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PerkIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const Icon = PERK_ICON_MAP[iconKey] ?? PERK_ICON_OPTIONS[0].Icon;
  return <Icon className={className ?? "size-6"} color="url(#perk-icon-gradient)" strokeWidth={1.5} />;
}
