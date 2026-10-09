import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info" | "outline" | "accent";

const tones: Record<Tone, string> = {
  default: "bg-secondary text-secondary-foreground border-transparent",
  success: "bg-success/12 text-success border-success/30 dark:bg-success/15",
  warning: "bg-warning/15 text-warning border-warning/35 dark:text-warning",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  info: "bg-info/12 text-info border-info/30",
  outline: "bg-transparent text-muted-foreground border-border",
  accent: "bg-accent text-accent-foreground border-transparent",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
}

export function Badge({ tone = "default", icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
