import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted hover:border-ring/40",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
  icon: "h-10 w-10 rounded-lg",
};

export function buttonClassName(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-150",
    "focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface LinkButtonProps {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

/** Кнопка-ссылка: используем <Link>, чтобы работали маршруты SPA и клавиатура. */
export function LinkButton({
  to,
  variant = "primary",
  size = "md",
  className,
  children,
  ariaLabel,
}: LinkButtonProps) {
  return (
    <Link to={to} aria-label={ariaLabel} className={buttonClassName(variant, size, className)}>
      {children}
    </Link>
  );
}
