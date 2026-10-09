import type { Lesson } from "@/types/content";
import { basicsLessons } from "./basics";
import { functionsLessons } from "./functions";
import { oopLessons } from "./oop";
import { filesLessons } from "./files";
import { networkLessons } from "./networks";

/** Все опубликованные уроки платформы. */
export const lessons: Lesson[] = [
  ...basicsLessons,
  ...functionsLessons,
  ...oopLessons,
  ...filesLessons,
  ...networkLessons,
];

const byId = new Map(lessons.map((l) => [l.id, l]));

export function getLesson(id: string | undefined): Lesson | undefined {
  return id ? byId.get(id) : undefined;
}

export function lessonsByCourse(courseId: string): Lesson[] {
  return lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
}

export function lessonsByModule(moduleId: string): Lesson[] {
  return lessons.filter((l) => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
}

/** Следующий и предыдущий уроки в пределах курса (для кнопок навигации). */
export function neighbours(
  courseId: string,
  lessonId: string,
): {
  prev?: Lesson;
  next?: Lesson;
} {
  const list = lessonsByCourse(courseId);
  const idx = list.findIndex((l) => l.id === lessonId);
  return {
    prev: idx > 0 ? list[idx - 1] : undefined,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined,
  };
}

export function relatedLessons(lesson: Lesson): Lesson[] {
  return lesson.relatedLessonIds
    .map((id) => byId.get(id))
    .filter((l): l is Lesson => !!l && l.id !== lesson.id)
    .slice(0, 6);
}
