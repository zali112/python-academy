import { describe, expect, it } from "vitest";
import { courses, getCourse } from "@/data/courses";
import { lessons, getLesson, lessonsByCourse, neighbours } from "@/data/lessons";
import { tasks } from "@/data/tasks";
import { quizzes } from "@/data/quizzes";
import { projects } from "@/data/projects";
import { pythonReference } from "@/data/referencePython";
import { networkConcepts } from "@/data/referenceNetworks";
import { achievements } from "@/data/achievements";
import { roadmap } from "@/data/roadmap";
import { searchIndex } from "@/data/searchIndex";

/** Проверка сетевой безопасности Python-примеров справочника сетей. */
function checkNetworkSafety(id: string, code: string): void {
  const ipRe = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g;
  // Строки, в которых код реально устанавливает соединение или резолвит имя.
  const connectRe = /\b(connect|bind|sendto|create_connection|urlopen|gethostbyname|getaddrinfo)\b/;
  const loopback = new Set(["127.0.0.1", "0.0.0.0", "::1"]);
  // Частные и документационные диапазоны: допустимы в объяснениях и вычислениях.
  const isLocalOrDoc = (ip: string): boolean =>
    loopback.has(ip) ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("192.0.2.") ||
    ip.startsWith("198.51.100.") ||
    ip.startsWith("203.0.113.");

  for (const line of code.split("\n")) {
    const ips = line.match(ipRe) ?? [];
    if (connectRe.test(line)) {
      const bad = ips.filter((ip) => !loopback.has(ip));
      expect(bad, `${id}: не-loopback адрес в сетевом вызове «${line.trim()}»`).toEqual([]);
    }
    const foreign = ips.filter((ip) => !isLocalOrDoc(ip));
    expect(foreign, `${id}: публичные адреса ${foreign.join(", ")}`).toEqual([]);
  }
}

/** Проверка целостности контента: ссылки, уникальность id и обязательные поля. */

describe("курсы и уроки", () => {
  it("id курсов уникальны", () => {
    expect(new Set(courses.map((c) => c.id)).size).toBe(courses.length);
  });

  it("id уроков уникальны", () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
  });

  it("каждый урок привязан к существующему курсу и модулю", () => {
    for (const lesson of lessons) {
      const course = getCourse(lesson.courseId);
      expect(course, `урок ${lesson.id}: нет курса ${lesson.courseId}`).toBeDefined();
      expect(
        course!.modules.some((m) => m.id === lesson.moduleId),
        `урок ${lesson.id}: нет модуля ${lesson.moduleId}`,
      ).toBe(true);
    }
  });

  it("lessonIds в курсах указывают на реальные уроки", () => {
    for (const course of courses) {
      for (const module of course.modules) {
        for (const id of module.lessonIds) {
          expect(getLesson(id), `${course.id}/${module.id}: нет урока ${id}`).toBeDefined();
        }
      }
    }
  });

  it("опубликованные курсы имеют хотя бы один урок", () => {
    for (const course of courses.filter((c) => c.published)) {
      expect(lessonsByCourse(course.id).length, `курс ${course.id} пуст`).toBeGreaterThan(0);
    }
  });

  it("порядок уроков внутри курса без пропусков", () => {
    for (const course of courses.filter((c) => c.published)) {
      const list = lessonsByCourse(course.id);
      expect(list.map((l) => l.order)).toEqual(list.map((_, i) => i + 1));
    }
  });

  it("у каждого урока есть цель, теория, код, ошибки, тест и памятка", () => {
    for (const lesson of lessons) {
      expect(lesson.goal.length, lesson.id).toBeGreaterThan(10);
      expect(lesson.theory.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(lesson.starterCode.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.solution.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.commonErrors.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(lesson.quiz.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(lesson.cheatSheet.length, lesson.id).toBeGreaterThanOrEqual(4);
      expect(lesson.lineByLine.length, lesson.id).toBeGreaterThanOrEqual(1);
    }
  });

  it("связанные уроки существуют", () => {
    for (const lesson of lessons) {
      for (const id of lesson.relatedLessonIds) {
        expect(getLesson(id), `${lesson.id} ссылается на ${id}`).toBeDefined();
      }
    }
  });

  it("соседи по курсу определяются на краях", () => {
    const first = lessonsByCourse("python-basics")[0];
    const last = lessonsByCourse("python-basics").at(-1)!;
    expect(neighbours("python-basics", first.id).prev).toBeUndefined();
    expect(neighbours("python-basics", last.id).next).toBeUndefined();
  });
});

describe("вопросы уроков и тренажёров", () => {
  const allQuizzes = lessons.flatMap((l) => l.quiz.map((q) => ({ ...q, id: `${l.id}:${q.id}` })));

  it("id вопросов уникальны", () => {
    const ids = [
      ...allQuizzes.map((q) => q.id),
      ...quizzes.flatMap((q) => q.questions.map((x) => `${q.id}:${x.id}`)),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("каждый вопрос имеет пояснение и данные своего типа", () => {
    for (const q of allQuizzes) {
      expect(q.explanation.length, q.id).toBeGreaterThan(5);
      if (q.type === "single" || q.type === "multi") {
        expect(q.options?.length, q.id).toBeGreaterThanOrEqual(2);
        expect(Array.isArray(q.correct), q.id).toBe(true);
      }
      if (q.type === "match" || q.type === "order") {
        const data = q.type === "match" ? q.pairs : q.sequence;
        expect((data?.length ?? 0) >= 2, q.id).toBe(true);
      }
      if (q.type === "input" || q.type === "fill" || q.type === "predict" || q.type === "bug") {
        expect(typeof q.correct === "string" && q.correct.length > 0, q.id).toBe(true);
      }
    }
  });

  it("тренажёры содержат вопросы с пояснениями", () => {
    expect(quizzes.length).toBeGreaterThanOrEqual(5);
    for (const set of quizzes) {
      expect(set.questions.length, set.id).toBeGreaterThanOrEqual(5);
      for (const q of set.questions)
        expect(q.explanation.length, `${set.id}/${q.id}`).toBeGreaterThan(5);
    }
  });
});

describe("практические задачи", () => {
  it("id уникальны и есть минимум 20 задач", () => {
    expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);
    expect(tasks.length).toBeGreaterThanOrEqual(20);
  });

  it("у каждой задачи есть тесты, подсказка и эталон", () => {
    for (const t of tasks) {
      expect(t.tests.length, t.id).toBeGreaterThanOrEqual(1);
      expect(t.hiddenTests.length, t.id).toBeGreaterThanOrEqual(1);
      expect(t.solution.length, t.id).toBeGreaterThan(10);
      expect(t.hint.length, t.id).toBeGreaterThan(10);
      expect(t.explanation.length, t.id).toBeGreaterThan(10);
      expect(t.constraints.length, t.id).toBeGreaterThanOrEqual(2);
      expect(getLesson(t.relatedLessonIds[0] ?? ""), `${t.id}: нет связанных уроков`).toBeDefined();
    }
  });

  it("каждый тест — валидный Python-код с assert", () => {
    for (const t of tasks) {
      for (const test of [...t.tests, ...t.hiddenTests]) {
        expect(test.code, `${t.id}: ${test.description}`).toMatch(/assert|raise/);
        expect(test.description.length).toBeGreaterThan(3);
      }
    }
  });
});

describe("справочники", () => {
  it("записи Python-справочника уникальны и связаны между собой", () => {
    const ids = new Set(pythonReference.map((r) => r.id));
    expect(ids.size).toBe(pythonReference.length);
    for (const r of pythonReference) {
      expect(r.example.length, r.id).toBeGreaterThan(0);
      expect(r.returns.length, r.id).toBeGreaterThan(0);
      for (const rel of r.related) expect(ids.has(rel), `${r.id} → ${rel}`).toBe(true);
    }
  });

  it("сетевые карточки содержат схему и Python-пример", () => {
    expect(networkConcepts.length).toBeGreaterThanOrEqual(10);
    for (const n of networkConcepts) {
      expect(n.scheme.length, n.id).toBeGreaterThanOrEqual(4);
      expect(n.pythonExample.length, n.id).toBeGreaterThan(20);
      expect(n.practice.length, n.id).toBeGreaterThan(20);
      // Безопасность: код, который реально обращается в сеть, работает только
      // с loopback; чистые вычисления (ipaddress) могут описывать и частные
      // диапазоны — публичных адресов в примерах быть не должно.
      checkNetworkSafety(n.id, n.pythonExample);
    }
  });
});

describe("проекты, достижения, дорожная карта", () => {
  it("проекты содержат этапы и критерии", () => {
    expect(projects.length).toBeGreaterThanOrEqual(5);
    for (const p of projects) {
      expect(p.stages.length, p.id).toBeGreaterThanOrEqual(4);
      expect(p.criteria.length, p.id).toBeGreaterThanOrEqual(5);
      expect(p.solutionCode.length, p.id).toBeGreaterThan(50);
    }
  });

  it("достижения ссылаются на валидные метрики", () => {
    const metrics = ["lessons", "tasks", "quiz", "streak", "projects", "minutes"];
    for (const a of achievements) {
      expect(metrics, a.id).toContain(a.metric);
      expect(a.target, a.id).toBeGreaterThan(0);
    }
    expect(new Set(achievements.map((a) => a.id)).size).toBe(achievements.length);
  });

  it("дорожная карта указывает на существующие курсы", () => {
    for (const node of roadmap) {
      for (const id of node.courseIds) expect(getCourse(id), `${node.id} → ${id}`).toBeDefined();
    }
  });
});

describe("поисковый индекс", () => {
  it("покрывает курсы, уроки, задачи и проекты", () => {
    expect(searchIndex.length).toBeGreaterThanOrEqual(
      courses.length + lessons.length + tasks.length + projects.length,
    );
    const ids = searchIndex.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("каждый элемент ведёт на внутренний маршрут", () => {
    for (const item of searchIndex) {
      expect(item.url.startsWith("/"), item.id).toBe(true);
      expect(item.title.length, item.id).toBeGreaterThan(0);
    }
  });
});
