import { Link } from "react-router-dom";
import { Compass, Home, Search } from "lucide-react";
import { PageMeta } from "@/components/ScrollToTop";
import { LinkButton } from "@/components/ui/LinkButton";
import { CodeBlock } from "@/components/CodeBlock";

const SUGGESTIONS: { to: string; label: string; hint: string }[] = [
  { to: "/courses", label: "Каталог курсов", hint: "программы от нуля до сетей" },
  { to: "/practice", label: "Практика", hint: "20+ задач с проверкой" },
  { to: "/reference/python", label: "Справочник Python", hint: "функции, методы, исключения" },
  { to: "/progress", label: "Мой прогресс", hint: "уроки, серия, достижения" },
];

/** 404: объясняет причину и предлагает рабочие пути вместо тупика. */
export function NotFoundPage() {
  return (
    <div className="container-app py-12 sm:py-16">
      <PageMeta
        title="Страница не найдена — Python Academy"
        description="Такой страницы нет. Вернись на главную, открой каталог курсов или найди материал через поиск."
      />
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-6xl font-black tracking-tight text-primary sm:text-7xl">404</p>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Такой страницы нет</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ссылка могла устареть, а адрес — содержать опечатку. Python Academy — статический сайт,
          поэтому ничего не сломалось: просто выбери один из рабочих маршрутов ниже.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <CodeBlock
          caption="python — шутка про 404"
          code={`try:
    open("/страница/не/найдена.py")
except FileNotFoundError:
    print("404: страницы нет, но знания остались")`}
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton to="/">
          <Home className="h-4 w-4" aria-hidden="true" /> На главную
        </LinkButton>
        <LinkButton to="/search" variant="outline">
          <Search className="h-4 w-4" aria-hidden="true" /> Поиск по сайту
        </LinkButton>
      </div>

      <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <li key={s.to}>
            <Link
              to={s.to}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-ring/40 hover:bg-muted/40"
            >
              <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
