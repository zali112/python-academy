import { useMemo, useState } from "react";
import { Award, Lock, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AchievementCard } from "@/components/AchievementCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { achievementStatuses } from "@/lib/achievements";
import { useProgressStore } from "@/store/progressStore";
import { cn } from "@/lib/utils";

type Filter = "all" | "unlocked" | "locked";

/** Страница достижений: что уже открыто и что к чему стремиться. */
export function AchievementsPage() {
  const state = useProgressStore();
  const [filter, setFilter] = useState<Filter>("all");

  const statuses = useMemo(
    () => achievementStatuses(state).sort((a, b) => Number(b.unlocked) - Number(a.unlocked)),
    [state],
  );
  const unlocked = statuses.filter((s) => s.unlocked);
  const visible = statuses.filter((s) =>
    filter === "all" ? true : filter === "unlocked" ? s.unlocked : !s.unlocked,
  );

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Достижения"
        description="Награды за последовательное обучение: пройденные уроки, решённые задачи, тесты и серии. Всё считается локально — без аккаунта и сервера."
        metaDescription="Достижения Python Academy: трофеи за уроки, задачи, тесты, проекты и серию занятий."
        badge={
          <Badge tone="warning" icon={<Trophy className="h-3 w-3" aria-hidden="true" />}>
            {unlocked.length} из {statuses.length}
          </Badge>
        }
        actions={
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Фильтр достижений">
            {(
              [
                ["all", "Все"],
                ["unlocked", "Открытые"],
                ["locked", "Закрытые"],
              ] as [Filter, string][]
            ).map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={filter === value ? "primary" : "outline"}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        }
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={<Lock className="h-8 w-8" aria-hidden="true" />}
          title={filter === "unlocked" ? "Пока нет открытых достижений" : "Все достижения открыты"}
          description={
            filter === "unlocked"
              ? "Пройди первый урок или реши задачу — первая награда не заставит себя ждать."
              : "Поздравляем! Все награды платформы получены. Можно начать курс заново и закрепить результат."
          }
          action={
            <Button variant="outline" onClick={() => setFilter("all")}>
              Показать все
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((status) => (
            <AchievementCard key={status.achievement.id} status={status} />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <span className={cn("font-medium text-foreground")}>Как это работает:</span> прогресс
          хранится в твоём браузере (localStorage). Открой «Настройки», чтобы выгрузить его в JSON и
          перенести на другое устройство.
        </p>
      </div>
    </div>
  );
}
