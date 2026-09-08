import { cn } from "@/lib/utils";

type HexIconProps = {
  size?: number;
  color?: string;
  className?: string;
};

export function HexIcon({ size = 14, color = "#EF3E23", className }: HexIconProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * (13 / 14))}
      viewBox="0 0 14 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.1516 0.504252L0.125887 5.99991C-0.0419623 6.31211 -0.0419623 6.69606 0.125887 6.99993L3.1516 12.5042C3.32677 12.8083 3.63897 13 3.97467 13L10.0256 13C10.3761 13 10.681 12.8081 10.8484 12.5042L13.8741 6.99993C14.042 6.69606 14.042 6.31195 13.8741 5.99991L10.8484 0.504252C10.6809 0.192218 10.3761 0 10.0256 0L3.97467 0C3.63912 0 3.32692 0.192218 3.1516 0.504252Z"
        fill={color}
      />
    </svg>
  );
}
