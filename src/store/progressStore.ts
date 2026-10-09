import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  at: number;
}

export interface ActivityDay {
  /** YYYY-MM-DD */
  date: string;
  /** количество действий за день */
  actions: number;
}

export interface ProgressState {
  /** Завершённые уроки */
  completedLessons: string[];
  /** Решённые практические задачи */
  completedTasks: string[];
  /** Результаты тестов */
  quizResults: QuizResult[];
  /** Избранное: id уроков, задач, проектов */
  favorites: string[];
  /** Заметки к урокам */
  notes: Record<string, string>;
  /** История активности по дням */
  activity: ActivityDay[];
  /** Последнее место для продолжения */
  lastVisited: { courseId: string; lessonId: string } | null;
  /** Завершённые проекты */
  completedProjects: string[];
  /** Текущая серия (вычисляется из activity) */
  createdAt: number;

  completeLesson: (id: string) => void;
  uncompleteLesson: (id: string) => void;
  completeTask: (id: string) => void;
  completeProject: (id: string) => void;
  saveQuizResult: (result: QuizResult) => void;
  toggleFavorite: (id: string) => void;
  setNote: (lessonId: string, note: string) => void;
  setLastVisited: (courseId: string, lessonId: string) => void;
  trackActivity: (actions?: number) => void;
  exportProgress: () => string;
  importProgress: (json: string) => boolean;
  resetProgress: () => void;
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Серия занятий: непрерывные дни с активностью, считается от сегодня назад. */
export function calcStreak(activity: ActivityDay[]): number {
  const days = new Set(activity.filter((a) => a.actions > 0).map((a) => a.date));
  if (days.size === 0) return 0;
  const cursor = new Date();
  // Если сегодня активности нет, серия может считаться со вчерашнего дня
  if (!days.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const initialState = {
  completedLessons: [] as string[],
  completedTasks: [] as string[],
  quizResults: [] as QuizResult[],
  favorites: [] as string[],
  notes: {} as Record<string, string>,
  activity: [] as ActivityDay[],
  lastVisited: null as { courseId: string; lessonId: string } | null,
  completedProjects: [] as string[],
  createdAt: Date.now(),
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeLesson: (id) => {
        if (get().completedLessons.includes(id)) return;
        set((s) => ({ completedLessons: [...s.completedLessons, id] }));
        get().trackActivity(2);
      },
      uncompleteLesson: (id) =>
        set((s) => ({ completedLessons: s.completedLessons.filter((x) => x !== id) })),
      completeTask: (id) => {
        if (get().completedTasks.includes(id)) return;
        set((s) => ({ completedTasks: [...s.completedTasks, id] }));
        get().trackActivity(3);
      },
      completeProject: (id) => {
        if (get().completedProjects.includes(id)) return;
        set((s) => ({ completedProjects: [...s.completedProjects, id] }));
        get().trackActivity(5);
      },
      saveQuizResult: (result) => {
        set((s) => ({
          quizResults: [...s.quizResults.filter((q) => q.quizId !== result.quizId), result],
        }));
        get().trackActivity(2);
      },
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      setNote: (lessonId, note) => set((s) => ({ notes: { ...s.notes, [lessonId]: note } })),
      setLastVisited: (courseId, lessonId) => set({ lastVisited: { courseId, lessonId } }),

      trackActivity: (actions = 1) => {
        const key = todayKey();
        set((s) => {
          const idx = s.activity.findIndex((a) => a.date === key);
          if (idx === -1) {
            return { activity: [...s.activity, { date: key, actions }] };
          }
          const next = [...s.activity];
          next[idx] = { date: key, actions: next[idx].actions + actions };
          return { activity: next };
        });
      },

      exportProgress: () => {
        const state = get();
        return JSON.stringify(
          {
            app: "python-academy",
            version: 1,
            exportedAt: new Date().toISOString(),
            progress: {
              completedLessons: state.completedLessons,
              completedTasks: state.completedTasks,
              completedProjects: state.completedProjects,
              quizResults: state.quizResults,
              favorites: state.favorites,
              notes: state.notes,
              activity: state.activity,
              lastVisited: state.lastVisited,
            },
          },
          null,
          2,
        );
      },

      importProgress: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (parsed?.app !== "python-academy" || !parsed.progress) return false;
          const p = parsed.progress;
          const asArray = (v: unknown): string[] =>
            Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
          set({
            completedLessons: asArray(p.completedLessons),
            completedTasks: asArray(p.completedTasks),
            completedProjects: asArray(p.completedProjects),
            favorites: asArray(p.favorites),
            quizResults: Array.isArray(p.quizResults) ? p.quizResults : [],
            notes: p.notes && typeof p.notes === "object" ? p.notes : {},
            activity: Array.isArray(p.activity)
              ? p.activity.filter(
                  (a: unknown): a is ActivityDay =>
                    !!a && typeof (a as ActivityDay).date === "string",
                )
              : [],
            lastVisited: p.lastVisited ?? null,
          });
          get().trackActivity(1);
          return true;
        } catch {
          return false;
        }
      },

      resetProgress: () => set({ ...initialState, createdAt: Date.now() }),
    }),
    { name: "python-academy-progress", version: 1 },
  ),
);

/* ---------- Селекторы (без React, удобно для тестов и страниц) ---------- */

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  nextLevelAt: number;
  prevLevelAt: number;
}

export function calcXp(
  s: Pick<
    ProgressState,
    "completedLessons" | "completedTasks" | "quizResults" | "completedProjects"
  >,
): number {
  const lessons = s.completedLessons.length * 20;
  const tasks = s.completedTasks.length * 35;
  const quizzes = s.quizResults.reduce(
    (acc, q) => acc + Math.round((q.score / Math.max(1, q.total)) * 50),
    0,
  );
  const projects = s.completedProjects.length * 150;
  return lessons + tasks + quizzes + projects;
}

const LEVEL_TITLES = [
  "Новичок",
  "Ученик",
  "Практик",
  "Уверенный",
  "Разработчик",
  "Инженер",
  "Мастер Python",
];

export function calcLevel(xp: number): LevelInfo {
  const step = 200;
  const level = Math.min(LEVEL_TITLES.length, Math.floor(xp / step) + 1);
  const prevLevelAt = (level - 1) * step;
  const nextLevelAt = level * step;
  return {
    level,
    title: LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, level - 1)],
    xp,
    prevLevelAt,
    nextLevelAt: nextLevelAt === prevLevelAt ? prevLevelAt + step : nextLevelAt,
  };
}
