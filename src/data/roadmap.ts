import type { RoadmapNode } from "@/types/content";

/**
 * Дорожная карта обучения: 9 узлов от «совсем не программировал»
 * до продвинутого Python и сетей. courseIds ссылаются на будущие id курсов.
 */
export const roadmap: RoadmapNode[] = [
  {
    id: "road-zero",
    title: "Совсем не программировал",
    description:
      "Точка отсчёта. Разбираешься, что такое переменная, типы данных и вывод в консоль, и пишешь " +
      "первые программы, которые действительно выполняются.",
    level: "beginner",
    courseIds: ["python-basics"],
  },
  {
    id: "road-logic",
    title: "Логика и ветвления",
    description:
      "Учишься задавать программе условия: если/иначе, сравнения, логические операторы и цикл while. " +
      "Плюс работа со строками — поиск, разрезание, форматирование текста.",
    level: "beginner",
    courseIds: ["python-conditions", "python-strings"],
  },
  {
    id: "road-collections",
    title: "Коллекции и циклы",
    description:
      "Списки, словари, множества и кортежи становятся основным инструментом. Ты собираешь данные " +
      "в структуры и обходишь их циклами for, не переписывая код по одному разу на элемент.",
    level: "elementary",
    courseIds: ["python-collections"],
  },
  {
    id: "road-functions",
    title: "Функции и структура кода",
    description:
      "Программа перестаёт быть одной длинной лентой. Ты делишь логику на функции, передаёшь параметры, " +
      "возвращаешь результат и читаешь чужой код без ужаса.",
    level: "elementary",
    courseIds: ["python-functions"],
  },
  {
    id: "road-files",
    title: "Файлы, текст и исключения",
    description:
      "Читаешь и записываешь файлы, работаешь с кодировками и CSV, обрабатываешь ошибки через " +
      "try/except. На выходе — программы, которые помнят данные между запусками.",
    level: "elementary",
    courseIds: ["python-files", "python-exceptions"],
  },
  {
    id: "road-oop",
    title: "ООП и модули",
    description:
      "Классы, объекты, инкапсуляция и наследование превращают хаотичные функции в понятную модель " +
      "предметной области. Модули и пакеты учат разносить код по файлам и управлять зависимостями.",
    level: "intermediate",
    courseIds: ["python-oop", "python-modules"],
  },
  {
    id: "road-algorithms",
    title: "Алгоритмы и структуры данных",
    description:
      "Разбираешь сложность алгоритмов, сортировки, поиск и рекурсию. Понимаешь, почему один код " +
      "работает за миллисекунды, а другой — за минуту.",
    level: "intermediate",
    courseIds: ["python-algorithms"],
  },
  {
    id: "road-tooling",
    title: "Инструменты разработчика",
    description:
      "Git, виртуальное окружение, типизация, итераторы, генераторы и декораторы — всё то, что " +
      "отличает учебный скрипт от кода, с которым комфортно работать в команде.",
    level: "intermediate",
    courseIds: ["python-git", "python-advanced"],
  },
  {
    id: "road-networks",
    title: "Продвинутый Python и сети",
    description:
      "Сокеты, TCP и UDP, HTTP, asyncio и асинхронные серверы. Ты понимаешь, как программы " +
      "общаются по сети, и способен написать собственный мини-сервис — от чата до обработчика запросов.",
    level: "advanced",
    courseIds: ["network-python", "python-advanced"],
  },
];
