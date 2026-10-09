import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, FileQuestion, Search } from "lucide-react";
import { searchIndex } from "@/data/searchIndex";
import { highlightParts, searchItems, typeLabel } from "@/lib/search";
import { cn } from "@/lib/utils";

/**
 * Глобальный поиск (Command Palette).
 * Открывается по Ctrl+K / Cmd+K и по кнопке в шапке.
 */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchItems(searchIndex, query).slice(0, 8), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(results.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" && results[active]) {
        e.preventDefault();
        navigate(results[active].url);
        onClose();
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, active, navigate, onClose]);

  useEffect(() => {
    if (open) {
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Поиск по сайту"
        className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Уроки, задачи, справочники…"
            aria-label="Поисковый запрос"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <FileQuestion className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">Ничего не найдено</p>
              <p className="text-xs text-muted-foreground">
                Попробуйте другое слово или откройте полный{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    onClose();
                  }}
                >
                  поиск
                </button>
                .
              </p>
            </div>
          )}

          {results.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                navigate(item.url);
                onClose();
                setQuery("");
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                i === active ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {highlightParts(item.title, query).map((part, idx) =>
                      part.hit ? (
                        <mark key={idx}>{part.text}</mark>
                      ) : (
                        <span key={idx}>{part.text}</span>
                      ),
                    )}
                  </span>
                  <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {typeLabel(item.type)}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {item.subtitle}
                </span>
              </span>
              {i === active && (
                <CornerDownLeft
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span>↑ ↓ — навигация, Enter — открыть</span>
          <span>Найдено: {results.length}</span>
        </div>
      </div>
    </div>
  );
}
