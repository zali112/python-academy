import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenCheck,
  CalendarCheck,
  Download,
  Flame,
  ListChecks,
  PlayCircle,
  Target,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/Progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import {
  ActivityChart,
  CourseProgressChart,
  TaskStatsChart,
} from "@/components/charts/ProgressCharts";
import { useProgressStore, calcLevel, calcStreak, calcXp } from "@/store/progressStore";
import { lessons } from "@/data/lessons";
import { tasks } from "@/data/tasks";
import { projects } from "@/data/projects";
import { achievementStatuses } from "@/lib/achievements";
import { toast } from "@/components/ui/Toaster";
import { percent, plural } from "@/lib/utils";

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold leading-tight">{value}</p>
          {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/** Прогресс: уровни, серия, графики активности и быстрый доступ к продолжению. */
export function ProgressPage() {
  const state = useProgressStore();

  const xp = useMemo(() => calcXp(state), [state]);
  const level = calcLevel(xp);
  const streak = calcStreak(state.activity);

  const lessonIds = useMemo(() => new Set(state.completedLessons), [state.completedLessons]);
  const completedLessons = lessons.filter((l) => lessonIds.has(l.id)).length;
  const solvedTasks = tasks.filter((t) => state.completedTasks.includes(t.id)).length;
  const doneProjects = projects.filter((p) => state.completedProjects.includes(p.id)).length;
  const quizzesPassed = state.quizResults.length;
  const unlocked = achievementStatuses(state).filter((s) => s.unlocked).length;

  const minutesLearned = lessons
    .filter((l) => lessonIds.has(l.id))
    .reduce((acc, l) => acc + l.durationMin, 0);

  const hasAnyProgress =
    completedLessons > 0 ||
    solvedTasks > 0 ||
    quizzesPassed > 0 ||
    doneProjects > 0 ||
    state.activity.length > 0;

  const exportJson = () => {
    const json = state.exportProgress();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `python-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Прогресс выгружен в JSON", "success");
  };

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Мой прогресс"
        description="Уровень, серия занятий, графики активности и список того, что уже сделано. Всё считается из локального хранилища — без аккаунта и облака."
        metaDescription="Прогресс в Python Academy: XP, уровень, серия дней, активность за 14 дней и статистика по урокам и задачам."
        breadcrumbs={[{ label: "Прогресс" }]}
        badge={
          <Badge tone="warning" icon={<Trophy className="h-3 w-3" aria-hidden="true" />}>
            Уровень {level.level}: {level.title}
          </Badge>
        }
        actions={
          <Button variant="outline" onClick={exportJson}>
            <Download className="h-4 w-4" aria-hidden="true" /> Выгрузить JSON
          </Button>
        }
      />

      {!hasAnyProgress ? (
        <EmptyState
          icon={<Target className="h-8 w-8" aria-hidden="true" />}
          title="Прогресс пока пуст"
          description="Пройди первый урок или реши задачу — здесь появятся XP, серия дней и графики."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <LinkButton to="/learn/python-basics/basics-1">
                <PlayCircle className="h-4 w-4" aria-hidden="true" /> Первый урок
              </LinkButton>
              <LinkButton to="/practice" variant="outline">
                Практика
              </LinkButton>
            </div>
          }
        />
      ) : null}

      {/* Уровень */}
      <section className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Текущий уровень</p>
            <p className="text-lg font-bold">
              {level.level}. {level.title}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {xp} XP · до следующего уровня {Math.max(0, level.nextLevelAt - xp)} XP
          </p>
        </div>
        <Progress
          value={xp - level.prevLevelAt}
          max={level.nextLevelAt - level.prevLevelAt}
          label={`Уровень ${level.level} из 7`}
          showValue
          tone="primary"
          className="mt-3"
        />
      </section>

      {/* Статистика */}
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={<BookOpenCheck className="h-4 w-4" aria-hidden="true" />}
          label="Пройдено уроков"
          value={`${completedLessons} из ${lessons.length}`}
          hint={`${minutesLearned} ${plural(minutesLearned, "минута", "минуты", "минут")} теории`}
        />
        <StatCard
          icon={<ListChecks className="h-4 w-4" aria-hidden="true" />}
          label="Решено задач"
          value={`${solvedTasks} из ${tasks.length}`}
          hint={percent(solvedTasks, tasks.length) + "% практики"}
        />
        <StatCard
          icon={<Flame className="h-4 w-4" aria-hidden="true" />}
          label="Серия занятий"
          value={`${streak} ${plural(streak, "день", "дня", "дней")}`}
          hint="непрерывные дни с активностью"
        />
        <StatCard
          icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />}
          label="Активных дней"
          value={state.activity.filter((a) => a.actions > 0).length}
          hint={`${quizzesPassed} ${plural(quizzesPassed, "тест", "теста", "тестов")} пройдено`}
        />
      </div>

      {/* Графики */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Активность за 14 дней</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Задачи</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskStatsChart solved={solvedTasks} total={tasks.length} />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Выполнено проектов: {doneProjects} из {projects.length} · открыто достижений:{" "}
              {unlocked}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Уроки по курсам</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseProgressChart completedLessons={state.completedLessons} />
        </CardContent>
      </Card>

      {/* Продолжение */}
      <section className="rounded-xl border border-primary/40 bg-primary/5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Продолжить обучение</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {state.lastVisited
                ? "Ты был здесь в последний раз — открой урок и продолжи с того же места."
                : "Начни с первого урока основ — он ведёт от print() до функций."}
            </p>
          </div>
          <Link
            to={
              state.lastVisited
                ? `/learn/${state.lastVisited.courseId}/${state.lastVisited.lessonId}`
                : "/learn/python-basics/basics-1"
            }
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <PlayCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            {state.lastVisited ? "Продолжить урок" : "Начать первый урок"}
          </Link>
        </div>
      </section>
    </div>
  );
}
