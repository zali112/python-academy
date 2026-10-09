import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  title: string;
  content: ReactNode;
}

export function Accordion({
  items,
  defaultOpen,
  className,
}: {
  items: AccordionItemData[];
  defaultOpen?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`accordion-${item.id}`}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium transition-colors sm:px-5 sm:text-base",
                  isOpen ? "bg-muted/50" : "hover:bg-muted/40",
                )}
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={`accordion-${item.id}`}
              hidden={!isOpen}
              className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5"
            >
              <div className="animate-fade-in">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
