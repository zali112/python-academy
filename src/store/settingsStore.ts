import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeGet, safeSet } from "@/lib/utils";

export type Theme = "light" | "dark" | "system";
export type RunnerMode = "demo" | "pyodide";

interface SettingsState {
  theme: Theme;
  sidebarCollapsed: boolean;
  /** Адаптер выполнения Python-кода: демо-симуляция или Pyodide из CDN */
  runnerMode: RunnerMode;
  fontSize: "small" | "medium" | "large";
  showLineNumbers: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setRunnerMode: (mode: RunnerMode) => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
  toggleLineNumbers: () => void;
  applyTheme: () => void;
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "system",
      sidebarCollapsed: false,
      runnerMode: "demo",
      fontSize: "medium",
      showLineNumbers: true,

      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setRunnerMode: (runnerMode) => set({ runnerMode }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleLineNumbers: () => set((s) => ({ showLineNumbers: !s.showLineNumbers })),

      applyTheme: () => {
        const { theme } = get();
        const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
        const root = document.documentElement;
        root.classList.toggle("dark", dark);
        root.style.colorScheme = dark ? "dark" : "light";
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", dark ? "#0b1f19" : "#0e7a5f");
      },
    }),
    {
      name: "python-academy-settings",
      partialize: (s) => ({
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
        runnerMode: s.runnerMode,
        fontSize: s.fontSize,
        showLineNumbers: s.showLineNumbers,
      }),
      onRehydrateStorage: () => (state) => {
        state?.applyTheme();
        // Смена системной темы на лету
        if (typeof window !== "undefined" && window.matchMedia) {
          window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", () => state?.applyTheme());
        }
      },
    },
  ),
);

/** Дополнительный слой для быстрого доступа к режиму исполнения вне React. */
export function getRunnerMode(): RunnerMode {
  const raw = safeGet("python-academy-settings");
  if (!raw) return "demo";
  try {
    return (JSON.parse(raw)?.state?.runnerMode as RunnerMode) ?? "demo";
  } catch {
    return "demo";
  }
}

export function rememberRunnerMode(mode: RunnerMode): void {
  const raw = safeGet("python-academy-settings");
  try {
    const parsed = raw ? JSON.parse(raw) : { state: {} };
    parsed.state = { ...(parsed.state ?? {}), runnerMode: mode };
    safeSet("python-academy-settings", JSON.stringify(parsed));
  } catch {
    /* сохранение не критично */
  }
}
