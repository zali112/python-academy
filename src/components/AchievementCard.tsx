import { Award, Lock } from "lucide-react";
import type { AchievementStatus } from "@/lib/achievements";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Award,
};

export function AchievementCard({ status }: { status: AchievementStatus }) {
  const { achievement, value, unlocked } = status;
  const Icon = ICONS[achievement.icon] ?? Award;

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border bg-card p-4 transition-all sm:p-5",
        unlocked
          ? "border-warning/50 shadow-sm shadow-warning/10"
          : "border-border opacity-85 hover:opacity-100",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
            unlocked ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground",
          )}
        >
          {unlocked ? (
            <Icon className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{achievement.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <Progress
          value={value}
          max={achievement.target}
          tone={unlocked ? "warning" : "primary"}
          label={`${Math.min(value, achievement.target)} / ${achievement.target}`}
          showValue={!unlocked}
        />
        <p className="mt-2 text-xs text-muted-foreground">{achievement.condition}</p>
      </div>

      {unlocked && (
        <span className="absolute right-3 top-3 rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning-foreground">
          Получено
        </span>
      )}
    </article>
  );
}
