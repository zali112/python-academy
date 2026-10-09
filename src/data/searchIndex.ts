import { courses } from "./courses";
import { lessons } from "./lessons";
import { tasks } from "./tasks";
import { projects } from "./projects";
import { pythonReference } from "./referencePython";
import { networkConcepts } from "./referenceNetworks";
import { quizzes } from "./quizzes";
import type { SearchItem } from "@/lib/search";

/**
 * Единый индекс поиска по сайту.
 * Строится на лету из тех же данных, что и страницы, поэтому всегда актуален.
 */
export const searchIndex: SearchItem[] = [
  ...courses.map<SearchItem>((c) => ({
    id: `course-${c.id}`,
    title: c.title,
    subtitle: c.subtitle,
    type: "course",
    url: `/courses/${c.id}`,
    text: c.description,
    level: c.level,
    keywords: [...c.skills, ...c.requiredKnowledge],
  })),
  ...lessons.map<SearchItem>((l) => ({
    id: `lesson-${l.id}`,
    title: l.title,
    subtitle: l.goal,
    type: "lesson",
    url: `/learn/${l.courseId}/${l.id}`,
    text: [l.simpleExplanation, ...l.theory, l.analogy, ...l.cheatSheet].join(" "),
    level: l.level,
    keywords: l.keywords ?? [],
  })),
  ...tasks.map<SearchItem>((t) => ({
    id: `task-${t.id}`,
    title: t.title,
    subtitle: t.description,
    type: "task",
    url: `/practice/${t.id}`,
    text: [t.description, t.hint, t.explanation, ...t.constraints].join(" "),
    level: t.level,
    keywords: [t.topic],
  })),
  ...projects.map<SearchItem>((p) => ({
    id: `project-${p.id}`,
    title: p.title,
    subtitle: p.goal,
    type: "project",
    url: `/projects#${p.id}`,
    text: [p.goal, p.brief, ...p.requiredKnowledge, ...p.criteria].join(" "),
    level: p.level,
    keywords: p.stages.map((s) => s.title),
  })),
  ...pythonReference.map<SearchItem>((r) => ({
    id: `ref-${r.id}`,
    title: r.name,
    subtitle: r.purpose,
    type: "reference",
    url: `/reference/python#${r.id}`,
    text: [r.purpose, r.syntax, r.returns, ...r.errors, r.example].join(" "),
    level: r.level,
    keywords: [r.category],
  })),
  ...networkConcepts.map<SearchItem>((n) => ({
    id: `net-${n.id}`,
    title: n.title,
    subtitle: n.simple,
    type: "reference",
    url: `/reference/networks#${n.id}`,
    text: [n.simple, n.technical, n.practice, ...n.scheme].join(" "),
    level: n.level,
    keywords: [n.group],
  })),
  ...quizzes.map<SearchItem>((q) => ({
    id: `quiz-${q.id}`,
    title: q.title,
    subtitle: q.description,
    type: "quiz",
    url: q.lessonId ? `/learn/${guessCourse(q.lessonId)}/${q.lessonId}` : "/trainers",
    text: q.questions.map((question) => question.question).join(" "),
    level: q.level,
    keywords: ["тест", "квиз"],
  })),
];

function guessCourse(lessonId: string): string {
  const lesson = lessons.find((l) => l.id === lessonId);
  return lesson?.courseId ?? "python-basics";
}
