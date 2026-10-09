/**
 * Единая типология контента платформы.
 * Все данные уроков, задач и проектов описаны этими интерфейсами,
 * поэтому страницы не знают, откуда пришли данные, и готовы к подключению API.
 */

export type Level = "beginner" | "elementary" | "intermediate" | "advanced";

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Новичок",
  elementary: "Базовый",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

export type MaterialType = "lesson" | "task" | "project" | "reference" | "quiz";

export const MATERIAL_LABEL: Record<MaterialType, string> = {
  lesson: "Урок",
  task: "Задача",
  project: "Проект",
  reference: "Справочник",
  quiz: "Тест",
};

/** Разбор кода построчно: что делает каждая строка примера. */
export interface LineExplanation {
  code: string;
  comment: string;
}

export type QuizType =
  "single" | "multi" | "input" | "order" | "match" | "predict" | "bug" | "fill";

export interface QuizOption {
  id: string;
  text: string;
}

/**
 * Вопрос теста после урока.
 * single/multi — выбор вариантов, input — ввод ответа,
 * order — порядок шагов, match — сопоставление, predict — предсказание вывода,
 * bug — поиск ошибки, fill — дополнить код.
 */
export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  /** Для single/multi */
  options?: QuizOption[];
  /** id правильных вариантов (single/multi) или строка правильного ответа (input/fill/predict/bug) */
  correct?: string[] | string;
  /** Пары «столбец A — столбец B» для match */
  pairs?: { left: string; right: string }[];
  /** Правильная последовательность для order (элементы в верном порядке) */
  sequence?: string[];
  explanation: string;
  hint?: string;
}

export interface CommonError {
  title: string;
  why: string;
  fix: string;
}

export interface PracticeTask {
  description: string;
  input?: string;
  expected?: string;
  constraints?: string[];
}

/** Урок. Структура повторяет канонический формат из ТЗ (20 блоков). */
export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  order: number;
  title: string;
  level: Level;
  durationMin: number;
  /** 2. Цель урока */
  goal: string;
  /** 3. Что ученик уже должен знать */
  prerequisites: string[];
  /** 4. Простое объяснение — интуитивно, без терминов */
  simpleExplanation: string;
  /** 5. Теория — абзацы, от простого к техническому */
  theory: string[];
  /** 6. Аналогия из реальной жизни */
  analogy: string;
  /** 7. Синтаксис (блок кода) */
  syntax: string;
  /** 8. Минимальный пример */
  minimalExample: string;
  /** 9. Разбор каждой строки */
  lineByLine: LineExplanation[];
  /** 10-13. Код для редактора: стартовый, решение, ожидаемый результат */
  starterCode: string;
  solution: string;
  expectedOutput: string;
  /** 15. Распространённые ошибки */
  commonErrors: CommonError[];
  /** 16. Практическое задание */
  practiceTask: PracticeTask;
  /** 17. Тест после урока */
  quiz: QuizQuestion[];
  /** 18. Краткая памятка */
  cheatSheet: string[];
  /** 19. Связанные уроки */
  relatedLessonIds: string[];
  /** Дополнительные ключевые слова для поиска */
  keywords?: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessonIds: string[];
  /**
   * Темы модуля. Для опубликованных курсов — то, что раскрыто в уроках,
   * для курсов, уроки которых публикуются постепенно, — полная программа.
   */
  topics?: string[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: Level;
  /** Ключ иконки lucide */
  icon: string;
  accent: string;
  durationHours: number;
  /** Что нужно знать до старта */
  requiredKnowledge: string[];
  /** Что умеешь после курса */
  skills: string[];
  modules: CourseModule[];
  /** true — уроки опубликованы, false — доступна только программа */
  published: boolean;
}

export interface TaskTest {
  description: string;
  /** Python-код с assert, запускается в песочнице */
  code: string;
}

export interface PracticeExercise {
  id: string;
  title: string;
  level: Level;
  topic: string;
  /** Сложность 1..5 */
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  inputExample?: string;
  outputExample?: string;
  constraints: string[];
  starterCode: string;
  solution: string;
  tests: TaskTest[];
  hiddenTests: TaskTest[];
  hint: string;
  explanation: string;
  relatedLessonIds: string[];
}

export interface ProjectStage {
  title: string;
  description: string;
}

export interface LearningProject {
  id: string;
  title: string;
  level: Level;
  category: "basics" | "files" | "networks" | "advanced";
  goal: string;
  requiredKnowledge: string[];
  brief: string;
  stages: ProjectStage[];
  fileStructure: string;
  criteria: string[];
  commonMistakes: string[];
  improvements: string[];
  solutionCode: string;
  durationHours: number;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  category: ReferenceCategory;
  purpose: string;
  syntax: string;
  params: { name: string; description: string }[];
  returns: string;
  example: string;
  errors: string[];
  related: string[];
  level: Level;
}

export type ReferenceCategory =
  | "builtins"
  | "types"
  | "str"
  | "list"
  | "dict"
  | "set"
  | "keywords"
  | "operators"
  | "exceptions"
  | "stdlib"
  | "oop"
  | "async"
  | "files"
  | "networks";

export const REFERENCE_CATEGORY_LABEL: Record<ReferenceCategory, string> = {
  builtins: "Встроенные функции",
  types: "Типы данных",
  str: "Методы строк",
  list: "Методы списков",
  dict: "Методы словарей",
  set: "Методы множеств",
  keywords: "Ключевые слова",
  operators: "Операторы",
  exceptions: "Исключения",
  stdlib: "Стандартная библиотека",
  oop: "ООП",
  async: "Асинхронность",
  files: "Работа с файлами",
  networks: "Сети",
};

/** Карточка справочника сетей: простые слова → техника → схема → Python → практика */
export interface NetworkConcept {
  id: string;
  title: string;
  group: string;
  simple: string;
  technical: string;
  /** Пошаговая схема: строки вида «Клиент → DNS-сервер: какой IP у example.com?» */
  scheme: string[];
  pythonExample: string;
  practice: string;
  level: Level;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  /** Цель в единицах измерения (уроки, задачи, дни подряд) */
  target: number;
  metric: "lessons" | "tasks" | "quiz" | "streak" | "projects" | "minutes";
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  level: Level;
  courseIds: string[];
}

/** Отдельный тест/квиз, не привязанный к одному уроку. */
export interface QuizSet {
  id: string;
  title: string;
  description: string;
  level: Level;
  /** Урок, после которого логично пройти тест */
  lessonId?: string;
  questions: QuizQuestion[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
}
