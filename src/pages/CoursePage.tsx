import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Layers,
  ListChecks,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LessonCard, courseIcon } from "@/components/CourseCard";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { Progress } from "@/components/ui/Progress";
import { getCourse } from "@/data/courses";
import { lessonsByCourse } from "@/data/lessons";
import { useProgressStore } from "@/store/progressStore";
import { LEVEL_LABEL } from "@/types/content";
import { percent } from "@/lib/utils";
import { NotFoundPage } from "./NotFoundPage";

export function CoursePage() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const lastVisited = useProgressStore((s) => s.lastVisited);

  const done = useMemo(() => new Set(completedLessons), [completedLessons]);
  const allLessons = useMemo(() => (course ? lessonsByCourse(course.id) : []), [course]);

  if (!course) return <NotFoundPage />;

  const Icon = courseIcon(course.icon);
  const completedCount = allLessons.filter((l) => done.has(l.id)).length;
  const progress = percent(completedCount, allLessons.length);
  const currentLessonId =
    lastVisited?.courseId === course.id ? lastVisited.lessonId : allLessons[0]?.id;

  const nextCourse = getNextCourseId(course.id);

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title={course.title}
        description={course.description}
        metaDescription={`${course.title} — ${course.subtitle}. Учебный курс Python Academy.`}
        breadcrumbs={[{ label: "Курсы", to: "/courses" }, { label: course.title }]}
        badge={<Badge tone="accent">{LEVEL_LABEL[course.level]}</Badge>}
        actions={
          course.published && allLessons.length > 0 ? (
            <LinkButton to={`/learn/${course.id}/${currentLessonId}`}>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {completedCount > 0 ? "Продолжить" : "Начать курс"}
            </LinkButton>
          ) : undefined
        }
      />

      {/* Мета-плитки */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Длительность
          </p>
          <p className="mt-1 font-semibold">{course.durationHours} ч</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" /> Модулей
          </p>
          <p className="mt-1 font-semibold">{course.modules.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Уроков
          </p>
          <p className="mt-1 font-semibold">{course.published ? allLessons.length : "готовятся"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5" aria-hidden="true" /> Прогресс
          </p>
          <p className="mt-1 font-semibold">{course.published ? `${progress}%` : "—"}</p>
        </div>
      </div>

      {course.published && allLessons.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-5">
          <Progress
            value={progress}
            label={`Пройдено ${completedCount} из ${allLessons.length} уроков`}
            showValue
            className="mb-3"
          />
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{course.skills.length}</span> навыков
              после курса
            </span>
            <span>
              <span className="font-medium text-foreground">{course.requiredKnowledge.length}</span>{" "}
              требуется знать
            </span>
          </div>
        </div>
      )}

      {!course.published && (
        <Alert tone="warning" title="Уроки этого курса публикуются постепенно" className="mb-6">
          Сейчас доступна полная программа: ты видишь все темы модулей. Как только уроки будут
          готовы, они появятся здесь и на дорожной карте. Параллельно пройди{" "}
          <Link to="/courses/python-basics" className="underline">
            курс для начинающих
          </Link>
          .
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Программа */}
        <section aria-labelledby="program-title">
          <h2 id="program-title" className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" /> Программа курса
          </h2>

          <div className="space-y-4">
            {course.modules.map((module, moduleIndex) => {
              const moduleLessons = allLessons.filter((l) => l.moduleId === module.id);
              const moduleDone = moduleLessons.filter((l) => done.has(l.id)).length;
              return (
                <div
                  key={module.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/40 px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                          {moduleIndex + 1}
                        </span>
                        {module.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    {moduleLessons.length > 0 && (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {moduleDone}/{moduleLessons.length}
                      </span>
                    )}
                  </div>

                  {moduleLessons.length > 0 ? (
                    <ul className="space-y-2 p-3 sm:p-4">
                      {moduleLessons.map((lesson, i) => (
                        <li key={lesson.id}>
                          <LessonCard
                            lessonId={lesson.id}
                            courseId={course.id}
                            title={lesson.title}
                            goal={lesson.goal}
                            level={lesson.level}
                            durationMin={lesson.durationMin}
                            completed={done.has(lesson.id)}
                            current={lesson.id === currentLessonId && !done.has(lesson.id)}
                            index={i}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="flex flex-wrap gap-2 p-4">
                      {(module.topics ?? []).map((topic) => (
                        <li key={topic}>
                          <Badge tone="outline">{topic}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Боковая колонка */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Что нужно знать
            </h2>
            <ul className="space-y-2 text-sm">
              {course.requiredKnowledge.map((k) => (
                <li key={k} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{k}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Что ты умеешь после курса
            </h2>
            <ul className="space-y-2 text-sm">
              {course.skills.map((skill) => (
                <li key={skill} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Что дальше
            </h2>
            {nextCourse ? (
              <Link
                to={`/courses/${nextCourse.id}`}
                className="interactive-card block rounded-lg border border-border p-3"
              >
                <span className="text-sm font-medium text-primary">{nextCourse.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {nextCourse.subtitle}
                </span>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                Это последний курс в программе — дальше выбирай проект из{" "}
                <Link to="/projects" className="text-primary underline">
                  раздела проектов
                </Link>
                .
              </p>
            )}
            <div className="mt-3">
              <Link to="/courses" className="text-xs text-muted-foreground hover:text-foreground">
                ← Ко всем курсам
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 flex justify-between">
        <LinkButton to="/courses" variant="ghost" size="sm">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Все курсы
        </LinkButton>
        <LinkButton to="/roadmap" variant="ghost" size="sm">
          Дорожная карта
        </LinkButton>
      </div>
    </div>
  );
}

/** Курс, который логично проходить следом. */
function getNextCourseId(
  currentId: string,
): { id: string; title: string; subtitle: string } | null {
  const order = [
    "python-basics",
    "python-conditions",
    "python-collections",
    "python-functions",
    "python-strings",
    "python-files",
    "python-exceptions",
    "python-oop",
    "python-modules",
    "python-advanced",
    "python-algorithms",
    "python-git",
    "network-python",
  ];
  const idx = order.indexOf(currentId);
  if (idx === -1 || idx === order.length - 1) return null;
  const nextId = order[idx + 1];
  const next = getCourse(nextId);
  return next ? { id: next.id, title: next.title, subtitle: next.subtitle } : null;
}
