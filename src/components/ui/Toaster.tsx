import { create } from "zustand";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "info" | "success" | "warning" | "danger";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = "info") => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, tone }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Показать уведомление: toast("Готово", "success") */
export function toast(message: string, tone: ToastTone = "info"): void {
  useToastStore.getState().push(message, tone);
}

const icons = {
  info: <Info className="h-5 w-5 text-info" aria-hidden="true" />,
  success: <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />,
  danger: <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />,
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-popover p-3.5 shadow-lg animate-slide-in-right",
            t.tone === "success" && "border-success/40",
            t.tone === "danger" && "border-destructive/40",
            t.tone === "warning" && "border-warning/50",
            t.tone === "info" && "border-info/40",
          )}
        >
          {icons[t.tone]}
          <p className="flex-1 text-sm text-foreground">{t.message}</p>
          <button
            type="button"
            aria-label="Скрыть уведомление"
            onClick={() => dismiss(t.id)}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
