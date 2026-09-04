import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepperStep = { id: string; label: string };

function statusOf(steps: StepperStep[], currentId: string, id: string): "complete" | "current" | "upcoming" {
  const currentIndex = steps.findIndex((s) => s.id === currentId);
  const index = steps.findIndex((s) => s.id === id);
  if (index < currentIndex) return "complete";
  if (index === currentIndex) return "current";
  return "upcoming";
}

export function Stepper({
  steps,
  currentId,
  onStepClick,
}: {
  steps: StepperStep[];
  currentId: string;
  onStepClick?: (id: string) => void;
}) {
  return (
    <ol className="flex items-center">
      {steps.map((step, i) => {
        const status = statusOf(steps, currentId, step.id);
        const clickable = status === "complete" && !!onStepClick;
        return (
          <li key={step.id} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(step.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg py-1.5 pr-2 text-sm font-medium transition-colors",
                clickable && "cursor-pointer hover:text-foreground",
                !clickable && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  status === "current" && "bg-primary text-primary-foreground",
                  status === "complete" && "bg-primary/15 text-primary",
                  status === "upcoming" && "bg-muted text-muted-foreground"
                )}
              >
                {status === "complete" ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden sm:inline",
                  status === "current" && "text-foreground",
                  status === "upcoming" && "text-muted-foreground",
                  status === "complete" && "text-foreground"
                )}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn("mx-1 h-px flex-1", status === "complete" ? "bg-primary/30" : "bg-border")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
