import { Info, AlertTriangle, CheckCircle2, XCircle, X } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: "border-info/35 bg-info/8 text-info",
    icon: <Info className="h-5 w-5 shrink-0" aria-hidden="true" />,
  },
  success: {
    wrap: "border-success/35 bg-success/10 text-success",
    icon: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />,
  },
  warning: {
    wrap: "border-warning/45 bg-warning/12 text-warning-foreground dark:text-warning",
    icon: <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />,
  },
  danger: {
    wrap: "border-destructive/35 bg-destructive/10 text-destructive",
    icon: <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />,
  },
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  title?: string;
  action?: ReactNode;
  onDismiss?: () => void;
}

export function Alert({
  tone = "info",
  title,
  action,
  onDismiss,
  className,
  children,
  ...props
}: AlertProps) {
  const t = tones[tone];
  return (
    <div
      role="alert"
      className={cn("flex gap-3 rounded-xl border p-4 text-sm", t.wrap, className)}
      {...props}
    >
      {t.icon}
      <div className="min-w-0 flex-1">
        {title && <p className="mb-1 font-semibold text-foreground">{title}</p>}
        <div className="text-foreground/85 [&_a]:underline">{children}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Закрыть сообщение"
          className="h-7 w-7 shrink-0 rounded-md text-foreground/60 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
        >
          <X className="mx-auto h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
