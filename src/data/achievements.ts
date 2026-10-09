import type { Achievement } from "@/types/content";

/**
 * Достижения платформы — 12 наград за регулярность и практику.
 * icon — имя иконки lucide в lowercase-kebab, metric — единица прогресса.
 */
export const achievements: Achievement[] = [
  {
    id: "first-lesson",
    title: "Первый шаг",
    description: "Самое сложное — начать. Эта награда отмечает твой самый первый пройденный урок.",
    icon: "rocket",
    condition: "Пройди свой первый урок до конца, ответив на вопросы теста.",
    target: 1,
    metric: "lessons",
  },
  {
    id: "steady-learner",
    title: "Постоянный ученик",
    description: "Пятнадцать уроков — это уже устойчивая привычка учиться, а не спонтанный порыв.",
    icon: "book-open",
    condition: "Заверши 15 уроков на платформе в любом порядке.",
    target: 15,
    metric: "lessons",
  },
  {
    id: "practice-master",
    title: "Мастер практики",
    description:
      "Код нужно писать руками: 25 решённых задач — уверенный старт в написании своего кода.",
    icon: "code",
    condition: "Реши 25 практических задач в тренажёре.",
    target: 25,
    metric: "tasks",
  },
  {
    id: "hundred-tasks",
    title: "Сто задач",
    description: "Сотня задач означает, что тебе почти ничего не кажется невозможным.",
    icon: "terminal",
    condition: "Реши 100 практических задач любого уровня сложности.",
    target: 100,
    metric: "tasks",
  },
  {
    id: "quiz-whiz",
    title: "Знаток тестов",
    description: "Тесты закрепляют теорию: двадцать пройденных проверок — материал точно освоен.",
    icon: "target",
    condition: "Пройди 20 тестов после уроков, набрав не менее 70% правильных ответов.",
    target: 20,
    metric: "quiz",
  },
  {
    id: "bug-hunter",
    title: "Охотник за багами",
    description:
      "Находить чужую ошибку сложнее, чем писать код с нуля, — это навык опытного разработчика.",
    icon: "bug",
    condition: "Успешно пройди 10 тестовых вопросов типа «найди и исправь ошибку».",
    target: 10,
    metric: "quiz",
  },
  {
    id: "week-streak",
    title: "Неделя в потоке",
    description: "Семь дней подряд — доказательство того, что обучение вошло в расписание.",
    icon: "flame",
    condition: "Заходи на платформу и выполняй любое задание 7 дней подряд без перерывов.",
    target: 7,
    metric: "streak",
  },
  {
    id: "month-streak",
    title: "Месяц дисциплины",
    description:
      "Тридцать дней подряд — уровень, до которого доходят единицы. Так рождается мастерство.",
    icon: "medal",
    condition: "Поддерживай серию занятий 30 дней подряд.",
    target: 30,
    metric: "streak",
  },
  {
    id: "first-hour",
    title: "Первый час",
    description:
      "Шестьдесят минут сосредоточенной работы — знак, что тебе действительно интересно.",
    icon: "zap",
    condition: "Набери суммарно 60 минут обучения в тренажёре и на уроках.",
    target: 60,
    metric: "minutes",
  },
  {
    id: "thousand-minutes",
    title: "Тысяча минут",
    description:
      "Более 16 часов практики — столько нужно, чтобы уверенно чувствовать себя в Python.",
    icon: "trophy",
    condition: "Набери суммарно 1000 минут обучения на платформе.",
    target: 1000,
    metric: "minutes",
  },
  {
    id: "first-project",
    title: "Первый проект",
    description:
      "Проект — это когда программа решает реальную задачу, а не повторяет пример из урока.",
    icon: "git-branch",
    condition: "Доведи до конца и сдай свой первый учебный проект.",
    target: 1,
    metric: "projects",
  },
  {
    id: "network-engineer",
    title: "Сетевой инженер",
    description:
      "Три сетевых проекта — значит, ты понимаешь, как программы общаются друг с другом.",
    icon: "network",
    condition: "Заверши 3 проекта из раздела сетей и продвинутых тем.",
    target: 3,
    metric: "projects",
  },
];
