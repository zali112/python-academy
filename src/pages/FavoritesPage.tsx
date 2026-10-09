import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { useProgressStore } from "@/store/progressStore";
import { lessons } from "@/data/lessons";
import { tasks } from "@/data/tasks";
import { projects } from "@/data/projects";
import { pythonReference } from "@/data/referencePython";
import { networkConcepts } from "@/data/referenceNetworks";
import { quizzes } from "@/data/quizzes";
import { LEVEL_LABEL, MATERIAL_LABEL, type Level, type MaterialType } from "@/types/content";

interface ResolvedFavorite {
  id: string;
  title: string;
  subtitle: string;
  type: MaterialType;
  url: string;
  level?: Level;
}

/**
 * Собирает избранное из всех коллекций: уроки, задачи, проекты, тесты, справочники.
 * Идентификаторы хранятся как есть, поэтому страница устойчива к добавлению новых типов.
 */
function resolve(favorites: string[]): { items: ResolvedFavorite[]; missing: number } {
  const lessonMap = new Map(lessons.map((l) => [l.id, l]));
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));
  const refMap = new Map(pythonReference.map((r) => [r.id, r]));
  const netMap = new Map(networkConcepts.map((n) => [n.id, n]));

  const items: ResolvedFavorite[] = [];
  let missing = 0;

  for (const id of favorites) {
    const lesson = lessonMap.get(id);
    if (lesson) {
      items.push({
        id,
        title: lesson.title,
        subtitle: lesson.goal,
        type: "lesson",
        url: `/learn/${lesson.courseId}/${lesson.id}`,
        level: lesson.level,
      });
      continue;
    }
    const task = taskMap.get(id);
    if (task) {
      items.push({
        id,
        title: task.title,
        subtitle: task.description,
        type: "task",
        url: `/practice/${task.id}`,
        level: task.level,
      });
      continue;
    }
    const project = projectMap.get(id);
    if (project) {
      items.push({
        id,
        title: project.title,
        subtitle: project.goal,
        type: "project",
        url: `/projects#${project.id}`,
        level: project.level,
      });
      continue;
    }
    const quiz = quizMap.get(id);
    if (quiz) {
      items.push({
        id,
        title: quiz.title,
        subtitle: quiz.description,
        type: "quiz",
        url: quiz.lessonId ? `/trainers#${quiz.id}` : "/trainers",
        level: quiz.level,
      });
      continue;
    }
    const ref = refMap.get(id);
    if (ref) {
      items.push({
        id,
        title: ref.name,
        subtitle: ref.purpose,
        type: "reference",
        url: `/reference/python#${ref.id}`,
        level: ref.level,
      });
      continue;
    }
    const net = netMap.get(id);
    if (net) {
      items.push({
        id,
        title: net.title,
        subtitle: net.simple,
        type: "reference",
        url: `/reference/networks#${net.id}`,
        level: net.level,
      });
      continue;
    }
    missing += 1;
  }
  return { items, missing };
}

/** Избранное: уроки, задачи и материалы, отмеченные сердечком. */
export function FavoritesPage() {
  const favorites = useProgressStore((s) => s.favorites);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);
  const { items, missing } = useMemo(() => resolve(favorites), [favorites]);

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Избранное"
        description="Отмеченные сердечком уроки, задачи, проекты и статьи справочников — чтобы вернуться к ним в один клик."
        metaDescription="Избранное в Python Academy: сохранённые уроки, задачи, проекты и справочные статьи."
        breadcrumbs={[{ label: "Избранное" }]}
        badge={<Badge tone="danger">{items.length}</Badge>}
        actions={
          items.length > 0 ? (
            <LinkButton to="/courses" variant="outline">
              Добавить ещё
            </LinkButton>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" aria-hidden="true" />}
          title="В избранном пока пусто"
          description="Нажми на сердечко в шапке урока, задачи или статьи справочника — материал появится здесь и сохранится даже после перезагрузки страницы."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <LinkButton to="/courses">К каталогу курсов</LinkButton>
              <LinkButton to="/reference/python" variant="outline">
                Справочник Python
              </LinkButton>
            </div>
          }
        />
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={item.url}
                      className="font-semibold transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    <Badge tone="outline">{MATERIAL_LABEL[item.type]}</Badge>
                    {item.level && <Badge tone="info">{LEVEL_LABEL[item.level]}</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Убрать «${item.title}» из избранного`}
                  onClick={() => toggleFavorite(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>

          {missing > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Недоступно элементов: {missing} — такие записи удаляются автоматически при следующем
              изменении избранного.
            </p>
          )}
        </>
      )}
    </div>
  );
}
