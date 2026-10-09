import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  Cpu,
  GraduationCap,
  Keyboard,
  Layers,
  Lock,
  Network,
  Play,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { PageMeta } from "@/components/ScrollToTop";
import { LinkButton } from "@/components/ui/LinkButton";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { CourseCard } from "@/components/CourseCard";
import { Roadmap } from "@/components/Roadmap";
import { CodeBlock } from "@/components/CodeBlock";
import { publishedCourses, getCourse } from "@/data/courses";
import { lessons, getLesson } from "@/data/lessons";
import { tasks } from "@/data/tasks";
import { projects } from "@/data/projects";
import { roadmap } from "@/data/roadmap";
import { faq } from "@/data/faq";
import { testimonials } from "@/data/testimonials";
import { useProgressStore } from "@/store/progressStore";

const advantages = [
  {
    icon: Keyboard,
    title: "Код прямо в браузере",
    text: "Редактор с подсветкой, автодополнением и запуском. Ничего не нужно устанавливать.",
  },
  {
    icon: Target,
    title: "Практика после каждой темы",
    text: "Задания с тестами, подсказками и разбором решения — знание закрепляется сразу.",
  },
  {
    icon: Network,
    title: "Отдельный курс по сетям",
    text: "Понятный путь от «что такое пакет» до TCP-серверов и диагностики на Python.",
  },
  {
    icon: TrendingUp,
    title: "Видимый прогресс",
    text: "Уровень, серия занятий, история активности и достижения — всё сохраняется локально.",
  },
  {
    icon: Shield,
    title: "Безопасный запуск",
    text: "Код выполняется в твоём браузере, без сервера и без доступа к чужим данным.",
  },
  {
    icon: Layers,
    title: "Справочники под рукой",
    text: "Python и компьютерные сети: синтаксис, примеры, схемы и типичные ошибки.",
  },
];

const demoCode = `def greet(name: str) -> str:
    return f"Привет, {name}!"

students = ["Аня", "Борис", "Вера"]
for person in students:
    print(greet(person))

# Результат:
# Привет, Аня!
# Привет, Борис!
# Привет, Вера!`;

export function HomePage() {
  const lastVisited = useProgressStore((s) => s.lastVisited);
  const completedLessons = useProgressStore((s) => s.completedLessons);

  const currentLesson = lastVisited ? getLesson(lastVisited.lessonId) : undefined;
  const currentCourse = lastVisited ? getCourse(lastVisited.courseId) : undefined;

  const startUrl = currentLesson
    ? `/learn/${lastVisited!.courseId}/${lastVisited!.lessonId}`
    : "/courses/python-basics";

  const stats = [
    { label: "уроков с практикой", value: lessons.length },
    { label: "практических задач", value: tasks.length },
    { label: "учебных проектов", value: projects.length },
    { label: "записей в справочниках", value: "+120" },
  ];

  return (
    <>
      <PageMeta
        title="Изучи Python с нуля"
        description="Интерактивная платформа: уроки Python с запуском кода в браузере, практические задачи, проекты, справочник языка и курс по компьютерным сетям."
      />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 0%, hsl(var(--primary) / 0.14), transparent 70%), radial-gradient(50% 40% at 85% 10%, hsl(var(--info) / 0.10), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="container-app relative grid gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="animate-fade-in">
            <Badge
              tone="accent"
              icon={<Sparkles className="h-3 w-3" aria-hidden="true" />}
              className="mb-5"
            >
              От первого print до сетевых серверов
            </Badge>
            <h1 className="text-balance text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
              Изучи Python с нуля и научись создавать{" "}
              <span className="text-primary">реальные проекты</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Понятная последовательность уроков, запуск кода прямо в браузере, задачи с
              автопроверкой и проекты, которыми можно гордиться. Без регистрации и лишней теории.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton size="lg" to={startUrl}>
                <Play className="h-4 w-4" aria-hidden="true" />
                {currentLesson ? "Продолжить обучение" : "Начать обучение"}
              </LinkButton>
              <LinkButton size="lg" variant="outline" to="/roadmap">
                Посмотреть программу
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
            </div>

            <ul className="mt-8 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "Работает на телефоне и компьютере",
                "Тёмная и светлая темы",
                "Прогресс сохраняется в браузере",
                "Можно учиться офлайн",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "120ms" }}>
            <CodeBlock code={demoCode} caption="hello.py" showLineNumbers />
            <p className="mt-3 text-xs text-muted-foreground">
              Пример кода из первого урока — его можно запустить прямо на платформе.
            </p>
          </div>
        </div>
      </section>

      {/* СТАТИСТИКА */}
      <section className="container-app py-10 sm:py-14" aria-labelledby="stats-title">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 id="stats-title" className="text-lg font-semibold sm:text-xl">
            Что внутри платформы
          </h2>
          <Badge tone="warning">пример данных — наполнение растёт</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-primary sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ПРОДОЛЖИТЬ */}
      <section className="container-app pb-4" aria-labelledby="continue-title">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 id="continue-title" className="text-base font-semibold sm:text-lg">
                {currentLesson ? "Продолжить обучение" : "С чего начать"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentLesson
                  ? `Ты остановился на уроке «${currentLesson.title}» в курсе «${currentCourse?.title ?? ""}».`
                  : "Начни с первого урока курса «Основы программирования» — он занимает 15 минут."}
              </p>
            </div>
            <LinkButton className="shrink-0" to={startUrl}>
              {currentLesson ? "Открыть урок" : "Перейти к первому уроку"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
          </div>
          {completedLessons.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Завершено уроков: {completedLessons.length} из {lessons.length}
            </p>
          )}
        </div>
      </section>

      {/* КУРСЫ */}
      <section className="container-app py-10 sm:py-14" aria-labelledby="courses-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 id="courses-title" className="text-xl font-bold sm:text-2xl">
              Популярные курсы
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Начни с основ или сразу выбери направление
            </p>
          </div>
          <Link to="/courses" className="shrink-0 text-sm font-medium text-primary hover:underline">
            Все курсы →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {publishedCourses.slice(0, 6).map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      </section>

      {/* ДОРОЖНАЯ КАРТА */}
      <section
        className="border-y border-border bg-muted/30 py-10 sm:py-14"
        aria-labelledby="roadmap-title"
      >
        <div className="container-app">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="roadmap-title" className="text-xl font-bold sm:text-2xl">
                Дорожная карта обучения
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Понятный путь: сначала основы, затем практика, потом продвинутые темы и сети
              </p>
            </div>
            <Link
              to="/roadmap"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              Открыть целиком →
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Roadmap nodes={roadmap.slice(0, 5)} completedLessons={completedLessons} />
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <Rocket className="h-4 w-4 text-primary" aria-hidden="true" /> Как учиться
                  </h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Пройди урок и запусти пример кода.</li>
                    <li>2. Реши тест в конце урока.</li>
                    <li>3. Выполни практическую задачу в редакторе.</li>
                    <li>4. Собери мини-проект и отмечай прогресс.</li>
                  </ol>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" /> Проверь
                    себя
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    В конце каждого блока ждут итоговые тесты, а в «Тренажёрах» — повторение
                    пройденного.
                  </p>
                  <Link
                    to="/trainers"
                    className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Перейти к тренажёрам →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className="container-app py-10 sm:py-14" aria-labelledby="advantages-title">
        <h2 id="advantages-title" className="mb-5 text-xl font-bold sm:text-2xl">
          Почему здесь удобно учиться
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div
              key={a.title}
              className="interactive-card rounded-xl border border-border bg-card p-5"
            >
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <a.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-semibold">{a.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ПРОЕКТЫ */}
      <section
        className="border-y border-border bg-muted/30 py-10 sm:py-14"
        aria-labelledby="projects-title"
      >
        <div className="container-app">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="projects-title" className="text-xl font-bold sm:text-2xl">
                Проекты для портфолио
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                От калькулятора до асинхронного сервера — с ТЗ и критериями готовности
              </p>
            </div>
            <Link
              to="/projects"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              Все проекты →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to={`/projects#${p.id}`}
                className="interactive-card group rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge
                    tone={
                      p.level === "beginner"
                        ? "success"
                        : p.level === "elementary"
                          ? "info"
                          : "accent"
                    }
                  >
                    {p.level === "beginner"
                      ? "Начальный"
                      : p.level === "elementary"
                        ? "Средний"
                        : "Продвинутый"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">≈ {p.durationHours} ч</span>
                </div>
                <h3 className="font-semibold group-hover:text-primary">{p.title}</h3>
                <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{p.goal}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ОТЗЫВЫ */}
      <section className="container-app py-10 sm:py-14" aria-labelledby="testimonials-title">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h2 id="testimonials-title" className="text-xl font-bold sm:text-2xl">
            Отзывы
          </h2>
          <Badge tone="warning">демонстрационные данные</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-xl border border-border bg-card p-5">
              <blockquote className="text-sm leading-relaxed text-foreground/85">
                «{t.text}»
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-app pb-14" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-5 text-xl font-bold sm:text-2xl">
          Частые вопросы
        </h2>
        <Accordion
          items={faq.map((item, i) => ({
            id: `faq-${i}`,
            title: item.question,
            content: <p>{item.answer}</p>,
          }))}
        />
        <div className="mt-6 flex justify-center">
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Узнать больше о проекте <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ФИНАЛЬНЫЙ ПРИЗЫВ */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="container-app flex flex-col items-center gap-5 py-12 text-center">
          <Code2 className="h-8 w-8" aria-hidden="true" />
          <h2 className="text-balance text-2xl font-bold sm:text-3xl">
            Первая программа — через 15 минут
          </h2>
          <p className="max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Никакой регистрации: открой первый урок, набери код и нажми «Запустить».
          </p>
          <LinkButton size="lg" variant="secondary" to="/courses/python-basics">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Открыть курс для начинающих
          </LinkButton>
          <p className="flex items-center gap-2 text-xs text-primary-foreground/70">
            <Cpu className="h-3.5 w-3.5" aria-hidden="true" /> Код выполняется локально в браузере
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Данные не покидают устройство
          </p>
        </div>
      </section>
    </>
  );
}
