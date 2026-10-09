import type { PythonRunner, RunResult } from "./types";

/**
 * Настоящий Python в браузере через Pyodide (WebAssembly).
 *
 * Загружается ТОЛЬКО по явному включению в настройках: пакет весит несколько
 * мегабайт, поэтому обычным пользователям хватает демо-режима.
 * Код исполняется локально в браузере, на сервер ничего не отправляется.
 */

const PYODIDE_VERSION = "0.26.4";
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PyodideAPI {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
}

let pyodidePromise: Promise<PyodideAPI> | null = null;
let failure: string | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-pyodide]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.pyodide = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Не удалось загрузить Pyodide с CDN"));
    document.head.appendChild(script);
  });
}

async function loadPyodideOnce(): Promise<PyodideAPI> {
  if (failure) throw new Error(failure);
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      await loadScript(`${CDN}pyodide.js`);
      const factory = (window as unknown as { loadPyodide?: (o: unknown) => Promise<PyodideAPI> })
        .loadPyodide;
      if (!factory) throw new Error("Pyodide недоступен: нет объекта loadPyodide");
      return factory({ indexURL: CDN });
    })().catch((err: Error) => {
      failure = err.message;
      pyodidePromise = null;
      throw err;
    });
  }
  return pyodidePromise;
}

export const pyodideRunner: PythonRunner = {
  id: "pyodide",
  label: "Pyodide (настоящий Python, из CDN)",
  description:
    "Полноценный Python 3 в WebAssembly. Загружается один раз из CDN, код выполняется локально в браузере.",

  async run(code, options = {}): Promise<RunResult> {
    const started = performance.now();
    let stdout = "";
    try {
      const pyodide = await loadPyodideOnce();
      pyodide.setStdout({ batched: (s) => (stdout += `${s}\n`) });
      pyodide.setStderr({ batched: (s) => (stdout += `${s}\n`) });

      const result = await Promise.race([
        pyodide.runPythonAsync(code),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Превышено время выполнения")),
            options.timeoutMs ?? 6000,
          ),
        ),
      ]);

      if (result !== undefined && result !== null && stdout.length === 0) {
        stdout = `${String(result)}\n`;
      }
      return {
        stdout,
        stderr: "",
        durationMs: Math.round(performance.now() - started),
        note: "Выполнен настоящий Python 3 (Pyodide, WebAssembly).",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        stdout,
        stderr: message,
        durationMs: Math.round(performance.now() - started),
        error: {
          type: message.includes("Не удалось загрузить") ? "NetworkError" : "RuntimeError",
          message,
        },
        note: failure ?? undefined,
      };
    }
  },
};
