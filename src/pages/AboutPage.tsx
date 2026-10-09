import { Link } from "react-router-dom";
import {
  BookOpen,
  Github,
  Globe,
  GraduationCap,
  Heart,
  Layers,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { CodeBlock } from "@/components/CodeBlock";
import { faq } from "@/data/faq";
import { testimonials } from "@/data/testimonials";
import { courses } from "@/data/courses";
import { tasks } from "@/data/tasks";
import { projects } from "@/data/projects";
import { lessons } from "@/data/lessons";

const PRINCIPLES: { icon: React.ReactNode; title: string; text: string }[] = [
  {
    icon: <Terminal className="h-5 w-5" aria-hidden="true" />,
    title: "Код запускается сразу",
    text: "Каждый урок и задача имеют редактор с кнопкой «Запустить». Читать без практики здесь непривычно и не нужно.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
    title: "Безопасно и без регистрации",
    text: "Код выполняется в браузере, аккаунты нет, прогресс лежит в localStorage. Сетевые примеры работают только с localhost.",
  },
  {
    icon: <Layers className="h-5 w-5" aria-hidden="true" />,
    title: "Одна типизация — много источников",
    text: "Уроки, задачи и справочники описаны общими типами TypeScript, поэтому данные легко заменить на API без переделки страниц.",
  },
  {
    icon: <Heart className="h-5 w-5" aria-hidden="true" />,
    title: "Честность вместо заглушек",
    text: "Курсы без опубликованных уроков показывают полную программу и честно пишут об этом, а не прячут пустые разделы.",
  },
];

const STACK: { name: string; role: string }[] = [
  { name: "React 18 + TypeScript", role: "интерфейс и строгая типизация контента" },
  { name: "Vite", role: "сборка статического сайта за секунды" },
  { name: "Tailwind CSS", role: "дизайн-система, светлая и тёмная темы" },
  { name: "React Router", role: "SPA-маршрутизация со страницей 404" },
  { name: "Zustand", role: "прогресс и настройки в localStorage" },
  { name: "Recharts", role: "графики активности и прогресса" },
  { name: "Pyodide (опционально)", role: "настоящий Python прямо в браузере" },
  { name: "GitHub Actions + Pages", role: "автодеплой при пуше в main" },
];

/** Страница «О проекте»: замысел, принципы, стек, безопасность, FAQ и отзывы. */
export function AboutPage() {
  const stats = [
    { label: "курсов в программе", value: courses.length },
    { label: "опубликованных уроков", value: lessons.length },
    { label: "практических задач", value: tasks.length },
    { label: "проектов", value: projects.length },
  ];

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="О проекте"
        description="Python Academy — статическая образовательная платформа: уроки с запуском кода, задачи с автопроверкой, справочники и прогресс без регистрации."
        metaDescription="О платформе Python Academy: цели, принципы, технологический стек, безопасность и ответы на частые вопросы."
        breadcrumbs={[{ label: "О проекте" }]}
        badge={<Badge tone="accent">открытый учебный проект</Badge>}
      />

      {/* Цифры */}
      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <dt className="text-xs text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-primary">{s.value}</dd>
          </div>
        ))}
      </dl>

      {/* Замысел */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Зачем это сделано</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            Большинство курсов по Python заканчиваются в тот момент, когда начинается самое
            интересное: первая независимая задача. Здесь теория сразу перетекает в редактор —
            меняешь код, жмёшь «Запустить», читаешь вывод и ищешь причину расхождения.
          </p>
          <p>
            Платформа работает как статический сайт: её можно открыть с GitHub Pages, скачать и
            запустить офлайн. Нет бэкенда — значит, нет и паролей, которые могут утечь. Прогресс
            хранится в браузере и переносится одним JSON-файлом.
          </p>
        </div>
      </section>

      {/* Принципы */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Принципы</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-primary">{p.icon}</span>
                  {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {p.text}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Стек */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Технологии</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {STACK.map((s) => (
            <li
              key={s.name}
              className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <span className="text-sm font-semibold">{s.name}</span>
              <span className="text-right text-xs text-muted-foreground">{s.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Безопасность */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Безопасность</h2>
        <Alert tone="info" title="Как исполняется код">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Демо-исполнитель — собственный интерпретатор подмножества Python на TypeScript, без
              доступа к системе.
            </li>
            <li>
              Pyodide (по желанию) грузится с CDN и работает внутри WebAssembly песочницы браузера.
            </li>
            <li>
              Сетевые примеры в уроках обращаются только к <code>127.0.0.1</code> и{" "}
              <code>localhost</code> — чужие системы не затрагиваются.
            </li>
            <li>Секретов, ключей и отправки данных на сервер в проекте нет.</li>
          </ul>
        </Alert>
        <div className="mt-4">
          <CodeBlock
            caption="Проверь сам: весь код страницы статический"
            code={`# никакого бэкенда — только браузер
import json
state = {"lessons": 0, "tasks": 0}
state["lessons"] += 1
print(json.dumps(state, ensure_ascii=False))`}
          />
        </div>
      </section>

      {/* Отзывы */}
      {testimonials.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Отзывы</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-xl border border-border bg-card p-4">
                <blockquote className="text-sm leading-relaxed text-foreground/90">
                  «{t.text}»
                </blockquote>
                <figcaption className="mt-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.name}</span> — {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Частые вопросы</h2>
        <Accordion
          items={faq.map((item, i) => ({
            id: `faq-${i}`,
            title: item.question,
            content: (
              <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            ),
          }))}
          defaultOpen="faq-0"
        />
      </section>

      {/* Действия */}
      <div className="flex flex-wrap gap-3">
        <LinkButton to="/courses">
          <GraduationCap className="h-4 w-4" aria-hidden="true" /> Начать учиться
        </LinkButton>
        <LinkButton to="/roadmap" variant="outline">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Дорожная карта
        </LinkButton>
        <LinkButton to="/search" variant="outline">
          <BookOpen className="h-4 w-4" aria-hidden="true" /> Поиск по материалам
        </LinkButton>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Github className="h-4 w-4" aria-hidden="true" /> Исходники
          <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </a>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Сделано как учебный пример фронтенд-архитектуры:{" "}
        <Link to="/settings" className="underline underline-offset-2 hover:text-foreground">
          экспорт и импорт прогресса
        </Link>
        , адаптер исполнения кода и контент, который легко заменить на API.
      </p>
    </div>
  );
}
