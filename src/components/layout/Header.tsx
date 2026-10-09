import { Link, useLocation } from "react-router-dom";
import { Code2, Heart, Info, Map, Moon, Search, Settings, Sun } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useProgressStore } from "@/store/progressStore";
import { SearchPalette } from "@/components/SearchPalette";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/courses", label: "Курсы" },
  { to: "/practice", label: "Практика" },
  { to: "/projects", label: "Проекты" },
  { to: "/reference/python", label: "Справочники" },
  { to: "/progress", label: "Прогресс" },
];

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const location = useLocation();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const favorites = useProgressStore((s) => s.favorites.length);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // Глобальная горячая клавиша Ctrl/Cmd + K открывает поиск
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="container-app flex h-16 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Открыть меню навигации"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted lg:hidden"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
            <rect width="18" height="2" rx="1" fill="currentColor" />
            <rect y="6" width="18" height="2" rx="1" fill="currentColor" />
            <rect y="12" width="18" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>

        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg"
          aria-label="Python Academy — на главную"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Code2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="truncate text-[15px] font-bold tracking-tight sm:block">
            Python Academy
          </span>
        </Link>

        <nav aria-label="Основная навигация" className="ml-4 hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Открыть поиск (Ctrl + K)"
            className="hidden h-10 w-52 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground md:flex xl:w-64"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">Поиск по сайту</span>
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Поиск"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border transition-colors hover:bg-muted md:hidden"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          <Link
            to="/favorites"
            aria-label={`Избранное, элементов: ${favorites}`}
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {favorites > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {favorites}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <div className="hidden items-center gap-1 sm:flex">
            <Link
              to="/roadmap"
              aria-label="Дорожная карта обучения"
              className="grid h-10 w-10 place-items-center rounded-lg border border-border transition-colors hover:bg-muted"
            >
              <Map className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/settings"
              aria-label="Настройки"
              className="hidden h-10 w-10 place-items-center rounded-lg border border-border transition-colors hover:bg-muted md:grid"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/about"
              aria-label="О проекте"
              className="hidden h-10 w-10 place-items-center rounded-lg border border-border transition-colors hover:bg-muted md:grid"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <SearchPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}
