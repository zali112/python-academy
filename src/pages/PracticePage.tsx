import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Flame,
  Heart,
  Lightbulb,
  Play,
  Terminal,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { CodeWorkspace } from "@/components/CodeWorkspace";
import { CodeBlock } from "@/components/CodeBlock";
import { useProgressStore } from "@/store/progressStore";
import { tasks } from "@/data/tasks";
import { getLesson } from "@/data/lessons";
import { toast } from "@/components/ui/Toaster";
import { LEVEL_LABEL, type PracticeExercise } from "@/types/content";
import { cn, plural } from "@/lib/utils";

const DIFFICULTY_LABEL = ["", "легко", "просто", "средне", "сложно", "очень сложно"];

function difficultyDots(level: number) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Сложность ${level} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn("h-1.5 w-4 rounded-full", i <= level ? "bg-primary" : "bg-muted")}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/* ------------------------------- Список задач ------------------------------- */

function TaskList() {
  const completedTasks = useProgressStore((s) => s.completedTasks);
  const [level, setLevel] = useState<"all" | PracticeExercise["level"]>("all");
  const [topic, setTopic] = useState<string>("all");
  const [onlyUnsolved, setOnlyUnsolved] = useState(false);
  const done = useMemo(() => new Set(completedTasks), [completedTasks]);

  const topics = useMemo(() => [...new Set(tasks.map((t) => t.topic))].sort(), []);

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (level === "all" || t.level === level) &&
          (topic === "all" || t.topic === topic) &&
          (!onlyUnsolved || !done.has(t.id)),
      ),
    [level, topic, onlyUnsolved, done],
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Уровень">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Уровень:</span>
          {(["all", "beginner", "elementary", "intermediate", "advanced"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                level === l
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {l === "all" ? "Все" : LEVEL_LABEL[l]}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Тема:</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-ring"
          >
            <option value="all">Все темы</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyUnsolved}
            onChange={(e) => setOnlyUnsolved(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          только нерешённые
        </label>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" role="status">
        Решено: {done.size} из {tasks.length} · показано: {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" aria-hidden="true" />}
          title="Под фильтры ничего не подошло"
          description="Сними фильтр «только нерешённые» или выбери другую тему — например «Списки»."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setLevel("all");
                setTopic("all");
                setOnlyUnsolved(false);
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => {
            const solved = done.has(t.id);
            return (
              <li key={t.id}>
                <Link
                  to={`/practice/${t.id}`}
                  className={cn(
                    "flex h-full flex-col rounded-xl border bg-card p-4 transition-colors",
                    solved ? "border-success/50" : "border-border hover:border-ring/40",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="outline">{t.topic}</Badge>
                    <Badge tone="info">{LEVEL_LABEL[t.level]}</Badge>
                    {solved && <Badge tone="success">решено</Badge>}
                  </div>
                  <h2 className="mt-2.5 font-semibold leading-tight">{t.title}</h2>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {t.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    {difficultyDots(t.difficulty)}
                    <span className="text-xs text-muted-foreground">
                      {DIFFICULTY_LABEL[t.difficulty]}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ------------------------------- Одна задача ------------------------------- */

function TaskDetail({ task }: { task: PracticeExercise }) {
  const completedTasks = useProgressStore((s) => s.completedTasks);
  const completeTask = useProgressStore((s) => s.completeTask);
  const favorites = useProgressStore((s) => s.favorites);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);

  const solved = completedTasks.includes(task.id);
  const isFav = favorites.includes(task.id);

  const idx = tasks.findIndex((t) => t.id === task.id);
  const prev = idx > 0 ? tasks[idx - 1] : undefined;
  const next = idx >= 0 && idx < tasks.length - 1 ? tasks[idx + 1] : undefined;

  const related = task.relatedLessonIds
    .map((id) => getLesson(id))
    .filter((l): l is NonNullable<typeof l> => !!l);

  return (
    <>
      <PageHeader
        title={task.title}
        description={task.description}
        metaDescription={`Задача «${task.title}» — ${task.topic}, уровень ${LEVEL_LABEL[task.level]}. Проверка тестами прямо в браузере.`}
        breadcrumbs={[{ label: "Практика", to: "/practice" }, { label: task.title }]}
        badge={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="outline">{task.topic}</Badge>
            <Badge tone="info">{LEVEL_LABEL[task.level]}</Badge>
            {solved && <Badge tone="success">решено</Badge>}
          </div>
        }
        actions={
          <>
            <Button
              variant={isFav ? "secondary" : "outline"}
              aria-pressed={isFav}
              onClick={() => toggleFavorite(task.id)}
            >
              <Heart
                className={cn("h-4 w-4", isFav ? "fill-destructive text-destructive" : "")}
                aria-hidden="true"
              />
              {isFav ? "В избранном" : "В избранное"}
            </Button>
            <Link
              to="/practice"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Все задачи
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <CodeWorkspace
            key={task.id}
            code={task.starterCode}
            solution={task.solution}
            tests={task.tests}
            hiddenTests={task.hiddenTests}
            hint={task.hint}
            title={`Редактор: ${task.title}`}
            onPassed={() => {
              if (!solved) {
                completeTask(task.id);
                toast("Задача решена! +35 XP", "success");
              }
            }}
          />

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Разбор решения
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{task.explanation}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Условие</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {task.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            <div className="mt-4">{difficultyDots(task.difficulty)}</div>
          </section>

          {(task.inputExample || task.outputExample) && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 text-sm font-semibold">Примеры</h2>
              {task.inputExample && (
                <div className="mb-3">
                  <p className="mb-1 text-xs text-muted-foreground">Ввод:</p>
                  <CodeBlock code={task.inputExample} showLineNumbers={false} tone="muted" />
                </div>
              )}
              {task.outputExample && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Вывод:</p>
                  <CodeBlock code={task.outputExample} showLineNumbers={false} tone="muted" />
                </div>
              )}
            </section>
          )}

          <section className="rounded-xl border border-warning/40 bg-warning/10 p-4">
            <h2 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" /> Подсказка
            </h2>
            <p className="text-sm leading-relaxed text-foreground/85">{task.hint}</p>
          </section>

          {related.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 text-sm font-semibold">Полезные уроки</h2>
              <ul className="space-y-1.5">
                {related.map((l) => (
                  <li key={l.id}>
                    <Link
                      to={`/learn/${l.courseId}/${l.id}`}
                      className="text-sm text-primary underline-offset-2 hover:underline"
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav
            className="flex items-center justify-between gap-2"
            aria-label="Навигация по задачам"
          >
            {prev ? (
              <Link
                to={`/practice/${prev.id}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Предыдущая
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to={`/practice/${next.id}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Следующая <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
}

/* --------------------------------- Страница --------------------------------- */

/** Практика: список задач и страница конкретной задачи с автопроверкой. */
export function PracticePage() {
  const { taskId } = useParams<{ taskId: string }>();
  const task = taskId ? tasks.find((t) => t.id === taskId) : undefined;
  const completedTasks = useProgressStore((s) => s.completedTasks);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [taskId]);

  if (taskId && !task) {
    return (
      <div className="container-app py-10">
        <PageHeader
          title="Задача не найдена"
          breadcrumbs={[{ label: "Практика", to: "/practice" }, { label: "404" }]}
        />
        <EmptyState
          icon={<Terminal className="h-8 w-8" aria-hidden="true" />}
          title="Такой задачи нет"
          description={`Возможно, ссылка устарела. Вернись к списку — там ${tasks.length} задач с проверкой.`}
          action={
            <Link
              to="/practice"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              К списку задач
            </Link>
          }
        />
      </div>
    );
  }

  if (task) return <TaskDetail task={task} />;

  const solvedCount = completedTasks.filter((id) => tasks.some((t) => t.id === id)).length;

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Практика"
        description="Задачи с автопроверкой: пишешь код, жмёшь «Проверить ответ» — прогоняются открытые и скрытые тесты. Ошибки выводятся прямо под консолью."
        metaDescription="Практические задачи по Python: 20+ упражнений с подсказками, эталонными решениями и тестами."
        breadcrumbs={[{ label: "Практика" }]}
        badge={
          <Badge tone="success">
            <Flame className="h-3 w-3" aria-hidden="true" /> {solvedCount} из {tasks.length}
          </Badge>
        }
        actions={
          <Link
            to="/playground"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Play className="h-4 w-4" aria-hidden="true" /> Свободная песочница
          </Link>
        }
      />

      <Alert tone="info" className="mb-6">
        Задачи идут от простого к сложному. Если застрял — открой подсказку, затем «Показать
        решение» и сравни свой подход с эталоном:{" "}
        {plural(tasks.length, "задача", "задачи", "задач")} в наборе.
      </Alert>

      <TaskList />
    </div>
  );
}
