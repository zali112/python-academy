import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { highlightParts, searchItems, type SearchFilters } from "@/lib/search";
import { searchIndex } from "@/data/searchIndex";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search as SearchIcon, X, FileQuestion } from "lucide-react";
import { LEVEL_LABEL, MATERIAL_LABEL, type Level, type MaterialType } from "@/types/content";
import { cn } from "@/lib/utils";

function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = highlightParts(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark key={i} className="rounded-sm bg-warning/30 px-0.5 text-foreground">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

const TYPE_OPTIONS: { value: SearchFilters["type"]; label: string }[] = [
  { value: "all", label: "Всё" },
  { value: "lesson", label: MATERIAL_LABEL.lesson },
  { value: "task", label: MATERIAL_LABEL.task },
  { value: "project", label: MATERIAL_LABEL.project },
  { value: "quiz", label: MATERIAL_LABEL.quiz },
  { value: "reference", label: MATERIAL_LABEL.reference },
  { value: "course", label: "Курсы" },
];

const LEVEL_OPTIONS: { value: Level | "all"; label: string }[] = [
  { value: "all", label: "Любой" },
  { value: "beginner", label: LEVEL_LABEL.beginner },
  { value: "elementary", label: LEVEL_LABEL.elementary },
  { value: "intermediate", label: LEVEL_LABEL.intermediate },
  { value: "advanced", label: LEVEL_LABEL.advanced },
];

/** Полноценная страница поиска: фильтры, подсветка совпадений, ссылки на материал. */
export function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchFilters["type"]>("all");
  const [level, setLevel] = useState<Level | "all">("all");

  const results = useMemo(
    () => searchItems(searchIndex, query, { type, level }),
    [query, type, level],
  );

  const reset = () => {
    setQuery("");
    setType("all");
    setLevel("all");
  };

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Поиск по платформе"
        description="Ищет по заголовкам, целям уроков, теории, ключевым словам и справочникам. Ctrl + K открывает быструю палитру прямо на любой странице."
        metaDescription="Поиск по курсам, урокам, задачам, проектам, тестам и справочникам Python Academy."
        breadcrumbs={[{ label: "Поиск" }]}
        badge={<Badge tone="outline">{searchIndex.length} материалов в индексе</Badge>}
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <label className="relative block">
          <span className="sr-only">Поисковый запрос</span>
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: словарь, рекурсия, TCP-хендшейк, pathlib…"
            className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-10 text-sm outline-none transition-colors focus:border-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Очистить запрос"
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </label>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Тип материала"
          >
            <span className="mr-1 text-xs font-medium text-muted-foreground">Тип:</span>
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={type === opt.value}
                onClick={() => setType(opt.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  type === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Уровень">
            <span className="mr-1 text-xs font-medium text-muted-foreground">Уровень:</span>
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={level === opt.value}
                onClick={() => setLevel(opt.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  level === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="my-4 text-sm text-muted-foreground" role="status" aria-live="polite">
        {query || type !== "all" || level !== "all"
          ? `Найдено: ${results.length}`
          : `В индексе ${results.length} материалов — введи запрос или выбери тип.`}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="h-8 w-8" aria-hidden="true" />}
          title="Ничего не найдено"
          description="Проверь раскладку и написание: поиск не зависит от регистра и понимает «е» вместо «ё». Попробуй корень слова — например «цикл» вместо «циклы для»."
          action={
            <Button variant="outline" onClick={reset}>
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {results.map((item) => (
            <li key={item.id}>
              <Link
                to={item.url}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/40 hover:bg-muted/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Highlighted text={item.title} query={query} />
                  <Badge tone="outline">
                    {item.type === "course" ? "Курс" : MATERIAL_LABEL[item.type as MaterialType]}
                  </Badge>
                  {item.level && <Badge tone="info">{LEVEL_LABEL[item.level]}</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  <Highlighted text={item.subtitle} query={query} />
                </p>
                <p className="mt-2 truncate text-xs text-muted-foreground/80">{item.url}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
