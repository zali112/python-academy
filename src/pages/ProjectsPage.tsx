import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Clock, Heart, Layers, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Progress } from "@/components/ui/Progress";
import { CodeBlock } from "@/components/CodeBlock";
import { Modal } from "@/components/ui/Modal";
import { projects } from "@/data/projects";
import { useProgressStore } from "@/store/progressStore";
import { LEVEL_LABEL, type LearningProject } from "@/types/content";
import { cn, plural } from "@/lib/utils";

const CATEGORY_LABEL: Record<LearningProject["category"], string> = {
  basics: "Основы",
  files: "Файлы и данные",
  networks: "Сети",
  advanced: "Продвинутый Python",
};

/** Карточка проекта: цель, этапы, критерии и эталонное решение — в модальном окне. */
function ProjectModal({
  project,
  completed,
  onClose,
  onToggle,
}: {
  project: LearningProject;
  completed: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  return (
    <Modal open onClose={onClose} title={project.title} description={project.goal} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone="info">{LEVEL_LABEL[project.level]}</Badge>
          <Badge tone="outline">{CATEGORY_LABEL[project.category]}</Badge>
          <Badge tone="outline">
            <Clock className="h-3 w-3" aria-hidden="true" /> ~{project.durationHours} ч
          </Badge>
          <Badge tone={completed ? "success" : "outline"}>
            {completed ? "выполнен" : "в работе"}
          </Badge>
        </div>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" /> Бриф
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{project.brief}</p>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Что нужно знать</h3>
          <ul className="flex flex-wrap gap-2">
            {project.requiredKnowledge.map((k) => (
              <li key={k}>
                <Badge tone="outline">{k}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Этапы работы</h3>
          <ol className="space-y-2">
            {project.stages.map((stage, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{stage.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {stage.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Дерево файлов</h3>
          <CodeBlock code={project.fileStructure} showLineNumbers={false} tone="muted" />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Критерии приёмки</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {project.criteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Типичные ошибки</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {project.commonMistakes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Как улучшить дальше</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {project.improvements.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Эталонное решение</h3>
          <CodeBlock
            code={project.solutionCode}
            caption="Решение целиком — можно запустить в песочнице"
          />
        </section>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant={completed ? "outline" : "success"} onClick={onToggle}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {completed ? "Отметить как незавершённый" : "Проект выполнен"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Страница проектов: от калькулятора до сетевого чата, с этапами и эталонами. */
export function ProjectsPage() {
  const completedProjects = useProgressStore((s) => s.completedProjects);
  const completeProject = useProgressStore((s) => s.completeProject);
  const favorites = useProgressStore((s) => s.favorites);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);

  const [category, setCategory] = useState<"all" | LearningProject["category"]>("all");
  const [level, setLevel] = useState<"all" | LearningProject["level"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const done = useMemo(() => new Set(completedProjects), [completedProjects]);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (category === "all" || p.category === category) && (level === "all" || p.level === level),
      ),
    [category, level],
  );

  const open = projects.find((p) => p.id === openId) ?? null;

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Проекты"
        description="Сквозные задачи на несколько часов: продумать структуру, написать код, проверить себя по критериям и посмотреть эталон. Это то, что потом кладётся в портфолио."
        metaDescription="Учебные проекты Python Academy: калькулятор, менеджер заметок, TCP-чат, анализатор логов и другие."
        breadcrumbs={[{ label: "Проекты" }]}
        badge={
          <Badge tone="success">
            {done.size} из {projects.length} выполнено
          </Badge>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Категория">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Категория:</span>
          {(["all", "basics", "files", "networks", "advanced"] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c === "all" ? "Все" : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
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
      </div>

      <Progress
        value={done.size}
        max={projects.length}
        tone="success"
        label={`Выполнено проектов: ${done.size} из ${projects.length}`}
        showValue
        className="mb-6"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-8 w-8" aria-hidden="true" />}
          title="Под фильтры ничего не подошло"
          description="Смешай категорию и уровень: например, «Основы» + «Новичок» — там шесть стартовых проектов."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setCategory("all");
                setLevel("all");
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const isDone = done.has(p.id);
            const isFav = favorites.includes(p.id);
            return (
              <li
                key={p.id}
                id={p.id}
                className={cn(
                  "flex scroll-mt-24 flex-col rounded-xl border bg-card p-4 transition-colors sm:p-5",
                  isDone ? "border-success/50" : "border-border hover:border-ring/40",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="outline">{CATEGORY_LABEL[p.category]}</Badge>
                  <Badge tone="info">{LEVEL_LABEL[p.level]}</Badge>
                  {isDone && (
                    <Badge
                      tone="success"
                      icon={<CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
                    >
                      выполнен
                    </Badge>
                  )}
                </div>

                <h2 className="mt-3 font-semibold leading-tight">{p.title}</h2>
                <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-muted-foreground">{p.goal}</p>

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> ~{p.durationHours} ч
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" aria-hidden="true" />
                    {p.stages.length} {plural(p.stages.length, "этап", "этапа", "этапов")}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setOpenId(p.id)}>
                    Открыть проект
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={isFav ? "Убрать из избранного" : "В избранное"}
                    aria-pressed={isFav}
                    onClick={() => toggleFavorite(p.id)}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        isFav ? "fill-destructive text-destructive" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Alert tone="info" className="mt-6">
        Проект считается завершённым вручную: открой карточку и нажми «Проект выполнен» — прогресс
        сохранится в браузере и попадёт в выгрузку JSON из настроек.
      </Alert>

      {open && (
        <ProjectModal
          project={open}
          completed={done.has(open.id)}
          onClose={() => setOpenId(null)}
          onToggle={() => completeProject(open.id)}
        />
      )}
    </div>
  );
}
