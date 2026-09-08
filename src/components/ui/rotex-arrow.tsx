import { cn } from "@/lib/utils";

type RotexArrowProps = {
  className?: string;
  size?: number;
  color?: string;
};

export function RotexArrow({ className, size = 9, color = "#EF3E23" }: RotexArrowProps) {
  return (
    <svg
      width={size}
      height={size * (15 / 9)}
      viewBox="0 0 9 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <path
        d="M-9.85165e-07 13.75L3.80036 13.75C4.17085 13.75 4.49314 13.5584 4.66935 13.2547L7.86671 7.74908C8.04443 7.44529 8.04443 7.06219 7.86671 6.74943L4.66935 1.25432C4.49314 0.941552 4.17085 0.750001 3.80036 0.750001L1.51331e-07 0.75"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}
