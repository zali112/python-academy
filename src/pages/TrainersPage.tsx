import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Brain, CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Progress } from "@/components/ui/Progress";
import { Quiz } from "@/components/Quiz";
import { quizzes } from "@/data/quizzes";
import { useProgressStore } from "@/store/progressStore";
import { LEVEL_LABEL, type QuizSet } from "@/types/content";
import { cn, plural } from "@/lib/utils";

const MAX_SCORE = 100;

/** Карточка теста: открыть → пройти → увидеть результат и разбор. */
function QuizCard({
  set,
  best,
  onOpen,
}: {
  set: QuizSet;
  best?: { score: number; total: number };
  onOpen: () => void;
}) {
  const pct = best ? Math.round((best.score / Math.max(1, best.total)) * 100) : 0;
  return (
    <li
      id={set.id}
      className="flex scroll-mt-24 flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/40 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="outline">
          <Brain className="h-3 w-3" aria-hidden="true" /> {set.questions.length}{" "}
          {plural(set.questions.length, "вопрос", "вопроса", "вопросов")}
        </Badge>
        <Badge tone="info">{LEVEL_LABEL[set.level]}</Badge>
        {best && (
          <Badge tone={pct >= 80 ? "success" : pct >= 50 ? "warning" : "danger"}>
            лучший результат: {best.score}/{best.total}
          </Badge>
        )}
      </div>

      <h2 className="mt-3 font-semibold leading-tight">{set.title}</h2>
      <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{set.description}</p>

      {best && (
        <Progress
          value={best.score}
          max={best.total}
          tone={pct >= 80 ? "success" : "primary"}
          className="mt-3"
          showValue
        />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onOpen}>
          {best ? "Пройти заново" : "Начать тест"}
        </Button>
        {set.lessonId && (
          <Link
            to={`/trainers/${set.id}`}
            className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            К уроку
          </Link>
        )}
      </div>
    </li>
  );
}

/** Тренажёры: самостоятельные тесты по темам с сохранением лучшего результата. */
export function TrainersPage() {
  const quizResults = useProgressStore((s) => s.quizResults);
  const saveQuizResult = useProgressStore((s) => s.saveQuizResult);
  const [level, setLevel] = useState<"all" | QuizSet["level"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const best = useMemo(() => {
    const map = new Map<string, { score: number; total: number }>();
    for (const r of quizResults) map.set(r.quizId, { score: r.score, total: r.total });
    return map;
  }, [quizResults]);

  const filtered = useMemo(
    () => quizzes.filter((q) => level === "all" || q.level === level),
    [level],
  );

  const open = quizzes.find((q) => q.id === openId) ?? null;

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (quizzes.some((q) => q.id === hash)) setOpenId(hash);
  }, []);

  const passedCount = [...best.values()].filter((b) => b.total > 0 && b.score === b.total).length;

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Тренажёры"
        description="Самостоятельные тесты по темам: 8 типов вопросов от выбора до поиска ошибки в коде. Результат сохраняется, ошибки разбираются сразу после проверки."
        metaDescription="Тренажёры Python Academy: тесты по основам, функциям, ООП, файлам и сетям с автопроверкой."
        breadcrumbs={[{ label: "Тренажёры" }]}
        badge={
          <Badge tone="warning" icon={<Trophy className="h-3 w-3" aria-hidden="true" />}>
            {passedCount} без ошибок
          </Badge>
        }
      />

      <div
        className="mb-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-4"
        role="group"
        aria-label="Фильтр по уровню"
      >
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Brain className="h-8 w-8" aria-hidden="true" />}
          title="Тестов на этом уровне пока нет"
          description="Выбери другой уровень или вернись к урокам: после каждого урока идёт свой тест."
          action={
            <Button variant="outline" onClick={() => setLevel("all")}>
              Показать все тесты
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((set) => (
            <QuizCard
              key={set.id}
              set={set}
              best={best.get(set.id)}
              onOpen={() => setOpenId(set.id)}
            />
          ))}
        </ul>
      )}

      <Alert tone="info" className="mt-6" title="Как считаются результаты">
        Каждый вопрос оценивается сразу после «Проверить»: правильный ответ открывает пояснение,
        неправильный — подсказку. Лучший результат по тесту сохраняется в localStorage и участвует в
        общем прогрессе.
      </Alert>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Тест: ${open.title}`}
            className="w-full max-w-3xl animate-scale-in rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{open.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{open.description}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpenId(null)}
                aria-label="Закрыть тест"
              >
                Закрыть
              </Button>
            </div>

            <Quiz
              key={open.id}
              questions={open.questions}
              resetKey={open.id}
              onComplete={(score, total) => {
                saveQuizResult({ quizId: open.id, score, total, at: Date.now() });
              }}
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Award className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Максимум {MAX_SCORE} XP за идеальный результат — итог виден на странице прогресса.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setOpenId(null)}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Выйти
                </Button>
                <Link
                  to="/progress"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Мой прогресс
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
