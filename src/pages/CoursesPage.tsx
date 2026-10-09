import { useMemo, useState } from "react";
import { Filter, GraduationCap, Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/CourseCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { courses } from "@/data/courses";
import { lessonsByCourse } from "@/data/lessons";
import { useProgressStore } from "@/store/progressStore";
import { LEVEL_LABEL, type Level } from "@/types/content";
import { cn } from "@/lib/utils";

type LevelFilter = Level | "all";
type StatusFilter = "all" | "published" | "program";

export function CoursesPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<"default" | "level" | "duration">("default");
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const done = useMemo(() => new Set(completedLessons), [completedLessons]);

  const filtered = useMemo(() => {
    let list = courses.filter((c) => {
      if (level !== "all" && c.level !== level) return false;
      if (status === "published" && !c.published) return false;
      if (status === "program" && c.published) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = [c.title, c.subtitle, c.description, ...c.skills].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const levelOrder: Record<Level, number> = {
      beginner: 0,
      elementary: 1,
      intermediate: 2,
      advanced: 3,
    };
    if (sort === "level")
      list = [...list].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
    if (sort === "duration") list = [...list].sort((a, b) => a.durationHours - b.durationHours);
    return list;
  }, [query, level, status, sort]);

  const reset = () => {
    setQuery("");
    setLevel("all");
    setStatus("all");
    setSort("default");
  };

  const hasFilters = query !== "" || level !== "all" || status !== "all" || sort !== "default";

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Каталог курсов"
        description="Полная программа от нуля до продвинутого Python: уроки с запуском кода, задачи и проекты. Курсы без опубликованных уроков показывают программу — так ты всегда видишь, что дальше."
        metaDescription="Каталог курсов Python Academy: основы, функции, ООП, файлы, продвинутый Python, алгоритмы, Git и компьютерные сети."
        badge={<Badge tone="outline">{courses.length} курсов</Badge>}
      />

      {/* Фильтры */}
      <div className="mb-6 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Поиск по курсам</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти курс: основы, сети, ООП…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring"
            />
          </label>

          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Сортировка"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring"
            >
              <option value="default">По порядку программы</option>
              <option value="level">По уровню</option>
              <option value="duration">По длительности</option>
            </select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={reset} aria-label="Сбросить фильтры">
                <X className="h-4 w-4" aria-hidden="true" /> Сбросить
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Filter className="h-3 w-3" aria-hidden="true" /> Уровень:
            </span>
            {(["all", "beginner", "elementary", "intermediate", "advanced"] as LevelFilter[]).map(
              (l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  aria-pressed={level === l}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    level === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l === "all" ? "Все" : LEVEL_LABEL[l]}
                </button>
              ),
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-muted-foreground">Статус:</span>
            {(
              [
                ["all", "Все"],
                ["published", "С уроками"],
                ["program", "Только программа"],
              ] as [StatusFilter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  status === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" role="status">
        Найдено курсов: {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-8 w-8" aria-hidden="true" />}
          title="Курсы не найдены"
          description="Попробуй изменить запрос или сбросить фильтры — например, выбери уровень «Новичок»."
          action={
            <Button onClick={reset} variant="outline">
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course, i) => {
            const all = lessonsByCourse(course.id);
            const completed = all.filter((l) => done.has(l.id)).length;
            return (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                totalLessons={all.length || undefined}
                completedLessons={completed}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
