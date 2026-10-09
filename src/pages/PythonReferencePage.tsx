import { useEffect, useMemo, useState } from "react";
import { Search, BookA, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CodeBlock } from "@/components/CodeBlock";
import { pythonReference } from "@/data/referencePython";
import {
  REFERENCE_CATEGORY_LABEL,
  LEVEL_LABEL,
  type ReferenceCategory,
  type ReferenceEntry,
} from "@/types/content";
import { cn } from "@/lib/utils";

/** Одна запись справочника: назначение, синтаксис, параметры, пример и ошибки. */
function ReferenceCard({ entry }: { entry: ReferenceEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <article
      id={entry.id}
      className="scroll-mt-24 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/30 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-base font-semibold text-primary">{entry.name}</h3>
        <Badge tone="outline">{REFERENCE_CATEGORY_LABEL[entry.category]}</Badge>
        <Badge tone="info">{LEVEL_LABEL[entry.level]}</Badge>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.purpose}</p>

      <div className="mt-3">
        <CodeBlock code={entry.syntax} caption="Синтаксис" showLineNumbers={false} tone="muted" />
      </div>

      {open && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {entry.params.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Параметры
              </h4>
              <ul className="space-y-1">
                {entry.params.map((p) => (
                  <li key={p.name} className="text-sm">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {p.name}
                    </code>{" "}
                    <span className="text-muted-foreground">— {p.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Возвращает
            </h4>
            <p className="text-sm text-muted-foreground">{entry.returns}</p>
          </div>

          <CodeBlock code={entry.example} caption="Пример" />

          {entry.errors.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Когда вызывает ошибки
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {entry.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={open ? "secondary" : "outline"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Свернуть" : "Подробнее"}
        </Button>
        {entry.related.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Связано: {entry.related.map((r) => `«${r}»`).join(", ")}
          </span>
        )}
      </div>
    </article>
  );
}

/** Справочник Python: встроенные функции, методы типов, ключевые слова и исключения. */
export function PythonReferencePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ReferenceCategory | "all">("all");

  const categories = useMemo(() => {
    const counts = new Map<ReferenceCategory, number>();
    for (const e of pythonReference) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pythonReference.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.purpose.toLowerCase().includes(q) ||
        e.syntax.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  // Якорь из поиска: раскрываем и прокручиваем к нужной записи.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-primary");
      window.setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 1600);
    }
  }, []);

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Справочник Python"
        description="Встроенные функции, методы строк, списков, словарей и множеств, ключевые слова, операторы, исключения и стандартная библиотека — с параметрами, примерами и типичными ошибками."
        metaDescription="Справочник Python: print, len, str, list, dict, set, исключения, операторы и stdlib с примерами кода."
        breadcrumbs={[{ label: "Справочники" }, { label: "Python" }]}
        badge={<Badge tone="accent">{pythonReference.length} записей</Badge>}
      />

      <div className="mb-6 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <label className="relative block">
          <span className="sr-only">Поиск по справочнику</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти: enumerate, split, KeyError…"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring"
          />
        </label>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Категории">
          <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Filter className="h-3 w-3" aria-hidden="true" /> Категория:
          </span>
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            Все ({pythonReference.length})
          </button>
          {categories.map(([cat, count]) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {REFERENCE_CATEGORY_LABEL[cat]} ({count})
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" role="status">
        Показано записей: {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookA className="h-8 w-8" aria-hidden="true" />}
          title="Такой записи нет"
          description="Попробуй другое написание или сбрось категорию — например, ищи «strip» в разделе «Методы строк»."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((entry) => (
            <ReferenceCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
