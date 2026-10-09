import { beforeEach, describe, expect, it } from "vitest";
import { calcLevel, calcStreak, calcXp, todayKey, useProgressStore } from "@/store/progressStore";

function reset() {
  useProgressStore.setState({
    completedLessons: [],
    completedTasks: [],
    quizResults: [],
    favorites: [],
    notes: {},
    activity: [],
    lastVisited: null,
    completedProjects: [],
    createdAt: Date.now(),
  });
}

describe("progressStore — XP и уровни", () => {
  beforeEach(reset);

  it("считает XP по урокам, задачам, тестам и проектам", () => {
    const xp = calcXp({
      completedLessons: ["a", "b"],
      completedTasks: ["t1"],
      quizResults: [{ quizId: "q1", score: 5, total: 10, at: 1 }],
      completedProjects: ["p1"],
    });
    // 2 урока × 20 + 1 задача × 35 + 50% от теста (25) + проект 150
    expect(xp).toBe(2 * 20 + 35 + 25 + 150);
  });

  it("идеальный тест даёт максимум", () => {
    const xp = calcXp({
      completedLessons: [],
      completedTasks: [],
      quizResults: [{ quizId: "q", score: 8, total: 8, at: 1 }],
      completedProjects: [],
    });
    expect(xp).toBe(50);
  });

  it("граничив уровень и показывает следующую цель", () => {
    expect(calcLevel(0)).toMatchObject({ level: 1, title: "Новичок" });
    expect(calcLevel(200)).toMatchObject({ level: 2 });
    expect(calcLevel(10_000)).toMatchObject({ level: 7, title: "Мастер Python" });
    const info = calcLevel(450);
    expect(info.nextLevelAt).toBeGreaterThan(info.xp);
    expect(info.prevLevelAt).toBeLessThanOrEqual(info.xp);
  });
});

describe("progressStore — серия занятий", () => {
  it("считает непрерывные дни от сегодня", () => {
    const days = [todayKey(), todayKey(new Date(Date.now() - 86400000))];
    expect(calcStreak(days.map((date) => ({ date, actions: 1 })))).toBe(2);
  });

  it("обрывается на пропущенном дне", () => {
    const activity = [
      { date: todayKey(), actions: 1 },
      { date: todayKey(new Date(Date.now() - 2 * 86400000)), actions: 3 },
    ];
    expect(calcStreak(activity)).toBe(1);
  });

  it("пустая активность — нулевая серия", () => {
    expect(calcStreak([])).toBe(0);
  });
});

describe("progressStore — действия", () => {
  beforeEach(reset);

  it("завершает урок один раз и трекает активность", () => {
    const s = useProgressStore.getState();
    s.completeLesson("basics-1");
    s.completeLesson("basics-1");
    expect(useProgressStore.getState().completedLessons).toEqual(["basics-1"]);
    expect(useProgressStore.getState().activity.length).toBeGreaterThan(0);
  });

  it("переключает избранное", () => {
    const s = useProgressStore.getState();
    s.toggleFavorite("basics-2");
    s.toggleFavorite("basics-2");
    expect(useProgressStore.getState().favorites).toEqual([]);
  });

  it("хранит одну запись результата теста на квиз", () => {
    const s = useProgressStore.getState();
    s.saveQuizResult({ quizId: "quiz-1", score: 3, total: 4, at: 1 });
    s.saveQuizResult({ quizId: "quiz-1", score: 4, total: 4, at: 2 });
    expect(useProgressStore.getState().quizResults).toHaveLength(1);
    expect(useProgressStore.getState().quizResults[0].score).toBe(4);
  });
});

describe("progressStore — экспорт и импорт", () => {
  beforeEach(reset);

  it("выгрузка проходит проверку формата", () => {
    useProgressStore.getState().completeLesson("basics-1");
    const json = useProgressStore.getState().exportProgress();
    const parsed = JSON.parse(json);
    expect(parsed.app).toBe("python-academy");
    expect(parsed.progress.completedLessons).toEqual(["basics-1"]);
  });

  it("импорт восстанавливает состояние", () => {
    const json = JSON.stringify({
      app: "python-academy",
      version: 1,
      progress: {
        completedLessons: ["files-1"],
        completedTasks: ["task-1"],
        favorites: ["oop-1"],
        notes: { "files-1": "важно" },
        activity: [{ date: todayKey(), actions: 2 }],
      },
    });
    expect(useProgressStore.getState().importProgress(json)).toBe(true);
    expect(useProgressStore.getState().completedLessons).toEqual(["files-1"]);
    expect(useProgressStore.getState().notes["files-1"]).toBe("важно");
    expect(useProgressStore.getState().favorites).toEqual(["oop-1"]);
  });

  it("отклоняет чужой или битый JSON", () => {
    expect(useProgressStore.getState().importProgress("не json")).toBe(false);
    expect(useProgressStore.getState().importProgress('{"app":"другое"}')).toBe(false);
    expect(useProgressStore.getState().completedLessons).toEqual([]);
  });

  it("сброс очищает всё", () => {
    const s = useProgressStore.getState();
    s.completeLesson("basics-1");
    s.completeTask("t1");
    s.resetProgress();
    expect(useProgressStore.getState().completedLessons).toEqual([]);
    expect(useProgressStore.getState().completedTasks).toEqual([]);
    expect(useProgressStore.getState().activity).toEqual([]);
  });
});
