import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  Lightbulb,
  ListChecks,
  NotebookPen,
  Puzzle,
  StickyNote,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CodeBlock } from "@/components/CodeBlock";
import { CodeWorkspace } from "@/components/CodeWorkspace";
import { Quiz } from "@/components/Quiz";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { toast } from "@/components/ui/Toaster";
import { getCourse } from "@/data/courses";
import { getLesson, lessonsByCourse, neighbours, relatedLessons } from "@/data/lessons";
import { useProgressStore } from "@/store/progressStore";
import { LEVEL_LABEL } from "@/types/content";
import { NotFoundPage } from "./NotFoundPage";

export function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);
  const course = getCourse(courseId);

  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const uncompleteLesson = useProgressStore((s) => s.uncompleteLesson);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);
  const favorites = useProgressStore((s) => s.favorites);
  const notes = useProgressStore((s) => s.notes);
  const setNote = useProgressStore((s) => s.setNote);
  const setLastVisited = useProgressStore((s) => s.setLastVisited);
  const trackActivity = useProgressStore((s) => s.trackActivity);

  const [note, setLocalNote] = useState("");
  const noteTimer = useRef<number | null>(null);

  const isActive = lesson ? completedLessons.includes(lesson.id) : false;
  const isFavorite = lesson ? favorites.includes(lesson.id) : false;
  const related = useMemo(() => (lesson ? relatedLessons(lesson) : []), [lesson]);
  const links = lesson ? neighbours(lesson.courseId, lesson.id) : {};

  useEffect(() => {
    if (!lesson) return;
    setLastVisited(lesson.courseId, lesson.id);
    trackActivity(1);
    setLocalNote(notes[lesson.id] ?? "");
    window.scrollTo({ top: 0, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  if (!lesson || !course) return <NotFoundPage />;

  const saveNote = (value: string) => {
    setLocalNote(value);
    if (noteTimer.current) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(lesson.id, value), 500);
  };

  const markComplete = () => {
    if (isActive) {
      uncompleteLesson(lesson.id);
      toast("Урок отмечен как непройденный", "info");
    } else {
      completeLesson(lesson.id);
      toast("Урок завершён! +20 XP", "success");
    }
  };

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title={lesson.title}
        metaDescription={`${lesson.title} — урок курса «${course.title}». ${lesson.goal}`}
        breadcrumbs={[
          { label: "Курсы", to: "/courses" },
          { label: course.title, to: `/courses/${course.id}` },
          { label: lesson.title },
        ]}
        badge={
          <>
            <Badge tone="accent">{LEVEL_LABEL[lesson.level]}</Badge>
            <Badge tone="outline">{lesson.durationMin} мин</Badge>
            {isActive && <Badge tone="success">Пройдено</Badge>}
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => toggleFavorite(lesson.id)}
              aria-pressed={isFavorite}
              className={
                isFavorite
                  ? "inline-flex h-10 items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 text-sm font-medium text-destructive"
                  : "inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
              }
            >
              <BookMarked className="h-4 w-4" aria-hidden="true" />
              {isFavorite ? "В избранном" : "В избранное"}
            </button>
            <button
              type="button"
              onClick={markComplete}
              className={
                isActive
                  ? "inline-flex h-10 items-center gap-2 rounded-lg bg-success px-4 text-sm font-medium text-success-foreground"
                  : "inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
              }
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {isActive ? "Пройден" : "Отметить завершённым"}
            </button>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="min-w-0 space-y-10">
          {/* 2. Цель */}
          <section
            aria-labelledby="goal"
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5"
          >
            <h2
              id="goal"
              className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary"
            >
              <Target className="h-4 w-4" aria-hidden="true" /> Цель урока
            </h2>
            <p className="text-[15px] leading-relaxed">{lesson.goal}</p>
          </section>

          {/* 3. Что уже должен знать */}
          <section aria-labelledby="prereq">
            <h2 id="prereq" className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" /> Что ты уже должен
              знать
            </h2>
            <ul className="flex flex-wrap gap-2">
              {lesson.prerequisites.map((p) => (
                <li key={p}>
                  <Badge tone="outline">{p}</Badge>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Простое объяснение */}
          <section aria-labelledby="simple">
            <h2 id="simple" className="mb-3 text-lg font-semibold">
              Объясняем просто
            </h2>
            <p className="prose-lesson">{lesson.simpleExplanation}</p>
          </section>

          {/* 5. Теория */}
          <section aria-labelledby="theory">
            <h2 id="theory" className="mb-3 text-lg font-semibold">
              Теория
            </h2>
            <div className="prose-lesson">
              {lesson.theory.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {/* 6. Аналогия */}
          <section aria-labelledby="analogy">
            <div className="rounded-xl border border-info/35 bg-info/8 p-4 sm:p-5">
              <h2
                id="analogy"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-info"
              >
                <Lightbulb className="h-4 w-4" aria-hidden="true" /> Аналогия из жизни
              </h2>
              <p className="text-[15px] leading-relaxed text-foreground/85">{lesson.analogy}</p>
            </div>
          </section>

          {/* 7-8. Синтаксис и минимальный пример */}
          <section aria-labelledby="syntax" className="space-y-4">
            <h2 id="syntax" className="text-lg font-semibold">
              Синтаксис и минимальный пример
            </h2>
            <CodeBlock code={lesson.syntax} caption="Синтаксис" />
            <CodeBlock code={lesson.minimalExample} caption="Минимальный пример" />
          </section>

          {/* 9. Разбор по строкам */}
          <section aria-labelledby="lines">
            <h2 id="lines" className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Eye className="h-5 w-5 text-primary" aria-hidden="true" /> Разбор построчно
            </h2>
            <ol className="space-y-3">
              {lesson.lineByLine.map((line, i) => (
                <li key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="overflow-x-auto border-b border-border bg-[#12161c] px-4 py-2.5">
                    <code className="whitespace-pre font-mono text-[13px] text-[#d7dde5]">
                      {line.code}
                    </code>
                  </div>
                  <p className="px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                    {line.comment}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* 10-14. Интерактивный редактор */}
          <section aria-labelledby="editor" className="scroll-mt-24">
            <h2 id="editor" className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Puzzle className="h-5 w-5 text-primary" aria-hidden="true" /> Попробуй сам
            </h2>
            <Alert tone="info" className="mb-4">
              Код выполняется прямо в браузере: ничего не устанавливай. Кнопка <b>«Запустить»</b>{" "}
              покажет вывод, <b>«Показать решение»</b> — эталон, <b>«Сбросить код»</b> — вернёт
              исходный шаблон. Ctrl + Enter тоже запускает.
            </Alert>
            <CodeWorkspace
              key={lesson.id}
              code={lesson.starterCode}
              solution={lesson.solution}
              expectedOutput={lesson.expectedOutput}
              title={lesson.title}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Это тренировочный редактор: изменения живут до перезагрузки страницы. Своё решение
              можно перенести в{" "}
              <Link to="/playground" className="text-primary underline">
                полный редактор кода
              </Link>
              .
            </p>
          </section>

          {/* 16. Практическое задание */}
          <section aria-labelledby="practice">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h2 id="practice" className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" /> Практическое
                задание
              </h2>
              <p className="text-[15px] leading-relaxed">{lesson.practiceTask.description}</p>
              {lesson.practiceTask.expected && (
                <pre className="mt-3 overflow-x-auto rounded-lg bg-[#12161c] p-3 font-mono text-xs text-[#d7dde5]">
                  {lesson.practiceTask.expected}
                </pre>
              )}
              {lesson.practiceTask.constraints && lesson.practiceTask.constraints.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {lesson.practiceTask.constraints.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground"
                        aria-hidden="true"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* 15. Распространённые ошибки */}
          <section aria-labelledby="errors">
            <h2 id="errors" className="mb-3 text-lg font-semibold">
              Распространённые ошибки
            </h2>
            <div className="space-y-3">
              {lesson.commonErrors.map((err) => (
                <div
                  key={err.title}
                  className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
                >
                  <p className="font-medium text-destructive">{err.title}</p>
                  <p className="mt-1 text-sm text-foreground/85">
                    <b>Почему:</b> {err.why}
                  </p>
                  <p className="mt-1 text-sm text-foreground/85">
                    <b>Как исправить:</b> {err.fix}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 17. Тест после урока */}
          {lesson.quiz.length > 0 && (
            <section aria-labelledby="quiz" className="scroll-mt-24">
              <h2 id="quiz" className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" /> Тест после
                урока
              </h2>
              <Quiz
                key={lesson.id}
                questions={lesson.quiz}
                resetKey={lesson.id}
                onComplete={(score, total) => {
                  if (score === total) toast(`Тест пройден: ${score} из ${total}`, "success");
                }}
              />
            </section>
          )}

          {/* 18. Памятка */}
          <section aria-labelledby="cheat">
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 sm:p-5">
              <h2
                id="cheat"
                className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
              >
                <StickyNote className="h-4 w-4" aria-hidden="true" /> Краткая памятка
              </h2>
              <ul className="space-y-2 text-sm">
                {lesson.cheatSheet.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Заметки */}
          <section aria-labelledby="notes">
            <h2 id="notes" className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <NotebookPen className="h-5 w-5 text-primary" aria-hidden="true" /> Мои заметки
            </h2>
            <textarea
              value={note}
              onChange={(e) => saveNote(e.target.value)}
              rows={4}
              aria-label="Заметка к уроку"
              placeholder="Запиши, что показалось сложным или что хочешь повторить…"
              className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none transition-colors focus:border-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Заметка сохраняется в этом браузере автоматически.
            </p>
          </section>

          {/* 19. Связанные уроки */}
          {related.length > 0 && (
            <section aria-labelledby="related">
              <h2 id="related" className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <BookMarked className="h-5 w-5 text-primary" aria-hidden="true" /> Связанные уроки
              </h2>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/learn/${r.courseId}/${r.id}`}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-ring/40 hover:bg-muted"
                  >
                    {r.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 20. Навигация */}
          <nav
            aria-label="Навигация по урокам"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
          >
            {links.prev ? (
              <Link
                to={`/learn/${links.prev.courseId}/${links.prev.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="max-w-[180px] truncate">{links.prev.title}</span>
              </Link>
            ) : (
              <Link
                to={`/courses/${course.id}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> К курсу
              </Link>
            )}

            {links.next ? (
              <LinkButton to={`/learn/${links.next.courseId}/${links.next.id}`}>
                <span className="max-w-[200px] truncate">Следующий урок</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
            ) : (
              <LinkButton to="/practice">
                Перейти к практике <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
            )}
          </nav>
        </article>

        {/* Боковое меню урока */}
        <aside className="hidden lg:block">
          <nav aria-label="Содержание урока" className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                В этом уроке
              </p>
              <ul className="space-y-1.5 text-sm">
                {[
                  ["goal", "Цель урока"],
                  ["simple", "Объясняем просто"],
                  ["theory", "Теория"],
                  ["syntax", "Синтаксис"],
                  ["lines", "Разбор по строкам"],
                  ["editor", "Попробуй сам"],
                  ["practice", "Задание"],
                  ["errors", "Ошибки"],
                  ["quiz", "Тест"],
                  ["cheat", "Памятка"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Уроки курса
              </p>
              <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
                {getLessonsOfCourse(lesson.courseId).map((l, i) => (
                  <li key={l.id}>
                    <Link
                      to={`/learn/${l.courseId}/${l.id}`}
                      className={
                        l.id === lesson.id
                          ? "block rounded-md bg-primary/10 px-2 py-1.5 text-sm font-medium text-primary"
                          : "block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                    >
                      {i + 1}. {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Перейти к следующему уроку?")) {
                  const next = neighbours(lesson.courseId, lesson.id).next;
                  if (next) navigate(`/learn/${next.courseId}/${next.id}`);
                }
              }}
              disabled={!neighbours(lesson.courseId, lesson.id).next}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              Следующий урок →
            </button>
          </nav>
        </aside>
      </div>
    </div>
  );
}

function getLessonsOfCourse(courseId: string) {
  return lessonsByCourse(courseId);
}
