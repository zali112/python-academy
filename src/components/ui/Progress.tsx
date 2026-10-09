import { cn } from "@/lib/utils";

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  tone?: "primary" | "success" | "warning";
  showValue?: boolean;
  className?: string;
}

const tones = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
};

export function Progress({
  value,
  max = 100,
  label,
  tone = "primary",
  showValue = false,
  className,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = max === 0 ? 0 : Math.round((clamped / max) * 100);
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          {label && <span>{label}</span>}
          {showValue && <span className="font-medium text-foreground">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Прогресс"}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", tones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
