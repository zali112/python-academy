import { achievements } from "@/data/achievements";
import { lessons } from "@/data/lessons";
import { calcStreak, type ProgressState } from "@/store/progressStore";
import type { Achievement } from "@/types/content";

export type ProgressGetter = Pick<
  ProgressState,
  "completedLessons" | "completedTasks" | "quizResults" | "activity" | "completedProjects"
>;

/** Текущее значение метрики для конкретного достижения. */
export function achievementValue(a: Achievement, state: ProgressGetter): number {
  switch (a.metric) {
    case "lessons":
      return state.completedLessons.length;
    case "tasks":
      return state.completedTasks.length;
    case "quiz":
      return state.quizResults.length;
    case "streak":
      return calcStreak(state.activity);
    case "projects":
      return state.completedProjects.length;
    case "minutes": {
      const done = new Set(state.completedLessons);
      return lessons.filter((l) => done.has(l.id)).reduce((acc, l) => acc + l.durationMin, 0);
    }
    default:
      return 0;
  }
}

export interface AchievementStatus {
  achievement: Achievement;
  value: number;
  unlocked: boolean;
  progress: number;
}

export function achievementStatuses(state: ProgressGetter): AchievementStatus[] {
  return achievements.map((a) => {
    const value = achievementValue(a, state);
    return {
      achievement: a,
      value,
      unlocked: value >= a.target,
      progress: Math.min(100, Math.round((value / a.target) * 100)),
    };
  });
}
