import {
  DollarSign, Building2, GraduationCap, Plane, Heart, Clock, Users, Award,
  Shield, Home, Car, Coffee, Laptop, Gift, BookOpen, Sun, Umbrella, Star,
  ThumbsUp, Zap, Trophy, Stethoscope, Baby, Dumbbell, PiggyBank, Wallet,
  CalendarCheck, MapPin, Utensils, Wifi, Bus, TrendingUp, Handshake, Sparkles,
  Target, Rocket, Globe, ShieldCheck,
} from "lucide-react";
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
  { key: "shield", label: "Shield (insurance)", Icon: Shield },
  { key: "shield-check", label: "Shield Check (security)", Icon: ShieldCheck },
  { key: "home", label: "Home (remote work)", Icon: Home },
  { key: "car", label: "Car (transport)", Icon: Car },
  { key: "bus", label: "Bus (commute)", Icon: Bus },
  { key: "coffee", label: "Coffee (perks/snacks)", Icon: Coffee },
  { key: "utensils", label: "Utensils (meals)", Icon: Utensils },
  { key: "laptop", label: "Laptop (equipment)", Icon: Laptop },
  { key: "wifi", label: "Wifi (connectivity)", Icon: Wifi },
  { key: "gift", label: "Gift (bonus/rewards)", Icon: Gift },
  { key: "book-open", label: "Book (learning)", Icon: BookOpen },
  { key: "sun", label: "Sun (leave/holidays)", Icon: Sun },
  { key: "umbrella", label: "Umbrella (protection)", Icon: Umbrella },
  { key: "star", label: "Star (recognition)", Icon: Star },
  { key: "thumbs-up", label: "Thumbs Up (culture)", Icon: ThumbsUp },
  { key: "zap", label: "Zap (fast growth)", Icon: Zap },
  { key: "trophy", label: "Trophy (achievement)", Icon: Trophy },
  { key: "stethoscope", label: "Stethoscope (medical)", Icon: Stethoscope },
  { key: "baby", label: "Baby (parental leave)", Icon: Baby },
  { key: "dumbbell", label: "Dumbbell (fitness)", Icon: Dumbbell },
  { key: "piggy-bank", label: "Piggy Bank (savings)", Icon: PiggyBank },
  { key: "wallet", label: "Wallet (allowance)", Icon: Wallet },
  { key: "calendar-check", label: "Calendar Check (leave)", Icon: CalendarCheck },
  { key: "map-pin", label: "Map Pin (location)", Icon: MapPin },
  { key: "trending-up", label: "Trending Up (growth)", Icon: TrendingUp },
  { key: "handshake", label: "Handshake (partnership)", Icon: Handshake },
  { key: "sparkles", label: "Sparkles (culture)", Icon: Sparkles },
  { key: "target", label: "Target (goals)", Icon: Target },
  { key: "rocket", label: "Rocket (career growth)", Icon: Rocket },
  { key: "globe", label: "Globe (global exposure)", Icon: Globe },
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
