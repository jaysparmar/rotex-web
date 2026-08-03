import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
  size?: number;
  color?: string;
};

export function SearchIcon({ className, size = 24, color = "#BEBEBE" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <circle cx="11.5" cy="11.5" r="9.5" stroke={color} strokeWidth="1.5" />
      <path d="M18.5 18.5L22 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
