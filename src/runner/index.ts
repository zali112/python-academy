import { demoRunner } from "./demoRunner";
import { pyodideRunner } from "./pyodideRunner";
import { useSettingsStore } from "@/store/settingsStore";
import type { PythonRunner } from "./types";

export * from "./types";

const RUNNERS: Record<string, PythonRunner> = {
  demo: demoRunner,
  pyodide: pyodideRunner,
};

/** Текущий исполнитель, выбранный пользователем в настройках. */
export function getRunner(): PythonRunner {
  const mode = useSettingsStore.getState().runnerMode;
  return RUNNERS[mode] ?? demoRunner;
}

export { demoRunner, pyodideRunner };
