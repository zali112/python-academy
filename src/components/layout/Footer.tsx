import { Link } from "react-router-dom";
import { Code2, Github, Heart, Mail } from "lucide-react";

const columns = [
  {
    title: "Обучение",
    links: [
      { to: "/courses", label: "Каталог курсов" },
      { to: "/roadmap", label: "Дорожная карта" },
      { to: "/practice", label: "Практические задачи" },
      { to: "/projects", label: "Проекты" },
      { to: "/trainers", label: "Тренажёры" },
    ],
  },
  {
    title: "Справочники",
    links: [
      { to: "/reference/python", label: "Справочник Python" },
      { to: "/reference/networks", label: "Справочник сетей" },
      { to: "/playground", label: "Редактор кода" },
      { to: "/search", label: "Поиск" },
    ],
  },
  {
    title: "Пользователю",
    links: [
      { to: "/progress", label: "Прогресс обучения" },
      { to: "/achievements", label: "Достижения" },
      { to: "/favorites", label: "Избранное" },
      { to: "/settings", label: "Настройки" },
      { to: "/about", label: "О проекте" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container-app py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Code2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-bold tracking-tight">Python Academy</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Интерактивная платформа для изучения Python с нуля: уроки, практика, проекты,
              справочник языка и большой раздел по компьютерным сетям.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Учебный проект. Прогресс хранится локально в браузере, регистрация не требуется.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Python Academy — демонстрационный образовательный проект.
            Все цифры на сайте помечены как пример данных.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-xs">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              feedback@example.com
            </span>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Репозиторий проекта на GitHub"
              className="transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
            </a>
            <span className="flex items-center gap-1.5 text-xs">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              сделано для новичков
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
