import { NavLink, useLocation } from "react-router-dom";
import {
  Award,
  BookOpen,
  Code2,
  FileCode2,
  FolderKanban,
  GraduationCap,
  Heart,
  Keyboard,
  LayoutDashboard,
  Map,
  Network,
  Play,
  Search,
  Settings,
  Target,
  Terminal,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useProgressStore, calcLevel, calcXp } from "@/store/progressStore";
import { Progress } from "@/components/ui/Progress";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Обучение",
    items: [
      { to: "/", label: "Главная", icon: LayoutDashboard, end: true },
      { to: "/courses", label: "Каталог курсов", icon: GraduationCap },
      { to: "/roadmap", label: "Дорожная карта", icon: Map },
      { to: "/favorites", label: "Избранное", icon: Heart },
    ],
  },
  {
    title: "Практика",
    items: [
      { to: "/playground", label: "Редактор кода", icon: Terminal },
      { to: "/practice", label: "Задачи", icon: Target },
      { to: "/projects", label: "Проекты", icon: FolderKanban },
      { to: "/trainers", label: "Тренажёры", icon: Play },
    ],
  },
  {
    title: "Справочники",
    items: [
      { to: "/reference/python", label: "Python", icon: BookOpen },
      { to: "/reference/networks", label: "Компьютерные сети", icon: Network },
      { to: "/search", label: "Поиск", icon: Search },
    ],
  },
  {
    title: "Мой прогресс",
    items: [
      { to: "/progress", label: "Прогресс обучения", icon: FileCode2 },
      { to: "/achievements", label: "Достижения", icon: Award },
      { to: "/settings", label: "Настройки", icon: Settings },
      { to: "/about", label: "О проекте", icon: Keyboard },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedTasks = useProgressStore((s) => s.completedTasks);
  const quizResults = useProgressStore((s) => s.quizResults);
  const completedProjects = useProgressStore((s) => s.completedProjects);
  const level = calcLevel(
    calcXp({ completedLessons, completedTasks, quizResults, completedProjects }),
  );

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Боковая навигация" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {section.title}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/15"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Уровень</span>
            <span className="text-xs font-semibold text-primary">
              {level.level}. {level.title}
            </span>
          </div>
          <Progress
            value={level.xp - level.prevLevelAt}
            max={level.nextLevelAt - level.prevLevelAt}
            label={`${level.xp} XP`}
          />
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Прогресс хранится локально в вашем браузере.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Десктопная боковая панель. */
export function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
      <SidebarContent />
    </aside>
  );
}

/** Мобильное меню-ящик. */
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  useEffect(() => {
    onClose();
    // закрываем при смене маршрута
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-0 top-0 h-full w-[280px] animate-slide-in-left border-r border-border bg-sidebar shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Code2 className="h-4 w-4 text-primary" aria-hidden="true" /> Python Academy
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть меню"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="h-[calc(100%-3.5rem)]">
          <SidebarContent onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
