/** Результат выполнения Python-кода. */
export interface RunResult {
  stdout: string;
  stderr: string;
  durationMs: number;
  error?: { type: string; message: string; line?: number };
  /** Человекочитаемое примечание (например, «демо-режим») */
  note?: string;
}

export interface RunOptions {
  /** Ограничение времени выполнения, мс */
  timeoutMs?: number;
}

/**
 * Адаптер выполнения кода (паттерн Strategy).
 *
 * UI не знает, как именно исполняется Python: достаточно реализовать этот
 * интерфейс. Сегодня доступны два исполнителя:
 *  - DemoPythonRunner — безопасный интерпретатор подмножества Python в браузере;
 *  - PyodidePythonRunner — настоящий CPython-подобный Python (Pyodide) из CDN.
 *
 * Позднее сюда же можно подключить серверный sandbox (POST /run), не меняя
 * страницы и компоненты: достаточно новой реализации PythonRunner и выбора
 * её в настройках.
 */
export interface PythonRunner {
  readonly id: "demo" | "pyodide" | "server";
  readonly label: string;
  readonly description: string;
  run(code: string, options?: RunOptions): Promise<RunResult>;
}

/** Форматирование ошибки исполнения для консоли. */
export function formatError(error: { type: string; message: string; line?: number }): string {
  const where = error.line ? ` (строка ${error.line})` : "";
  return `${error.type}: ${error.message}${where}`;
}
