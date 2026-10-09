import { formatError, type PythonRunner, type RunResult } from "./types";
import { runPythonLite } from "./pythonLite";

/**
 * Демонстрационный исполнитель: работает без сети и без сервера,
 * исполняя подмножество Python прямо в браузере.
 */
export const demoRunner: PythonRunner = {
  id: "demo",
  label: "Демо-режим (в браузере)",
  description:
    "Безопасный интерпретатор подмножества Python. Работает офлайн, без сервера. Полный язык — по переключателю Pyodide.",

  async run(code, options = {}): Promise<RunResult> {
    const started = performance.now();
    const outcome = await Promise.race([
      Promise.resolve().then(() => runPythonLite(code)),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Превышено время выполнения")),
          options.timeoutMs ?? 5000,
        ),
      ),
    ]).catch((err: Error) => ({
      output: "",
      error: { type: "TimeoutError", message: err.message } as const,
    }));

    const durationMs = Math.round(performance.now() - started);
    return {
      stdout: outcome.output,
      stderr: outcome.error ? formatError(outcome.error) : "",
      durationMs,
      error: outcome.error as RunResult["error"],
      note: "Выполнено встроенным демо-интерпретатором (без сервера).",
    };
  },
};
