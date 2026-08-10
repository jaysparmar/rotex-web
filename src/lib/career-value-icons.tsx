import { TrendingUp, BadgeCheck, Lightbulb, Users, RotateCcw, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const VALUE_ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "trending-up", label: "Trending Up (growth)", Icon: TrendingUp },
  { key: "lightbulb", label: "Lightbulb (innovation)", Icon: Lightbulb },
  { key: "rotate-ccw", label: "Rotate (learning)", Icon: RotateCcw },
  { key: "badge-check", label: "Badge Check (values)", Icon: BadgeCheck },
  { key: "users", label: "Users (teamwork)", Icon: Users },
  { key: "target", label: "Target (challenge)", Icon: Target },
];

const VALUE_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  VALUE_ICON_OPTIONS.map((o) => [o.key, o.Icon])
);

export function ValueIcon({ iconKey }: { iconKey: string }) {
  const Icon = VALUE_ICON_MAP[iconKey] ?? VALUE_ICON_OPTIONS[0].Icon;
  return <Icon className="size-5 text-red-600" strokeWidth={1.5} />;
}
