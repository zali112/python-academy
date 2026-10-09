import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  RotateCcw,
  Play,
  XCircle,
} from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { getRunner } from "@/runner";
import type { RunResult } from "@/runner/types";
import type { TaskTest } from "@/types/content";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";

export interface CodeWorkspaceProps {
  /** Начальный код. Компонент сам хранит текущее содержимое редактора. */
  code: string;
  /** Уведомление родителя об изменении кода (необязательно). */
  onCodeChange?: (code: string) => void;
  /** Код эталонного решения — открывается по кнопке «Показать решение» */
  solution?: string;
  /** Ожидаемый вывод для сверки */
  expectedOutput?: string;
  /** Тесты, которые запускаются после «Проверить» */
  tests?: TaskTest[];
  hiddenTests?: TaskTest[];
  /** Подсказка (сворачивается по умолчанию) */
  hint?: string;
  title?: string;
  rows?: number;
  onPassed?: () => void;
  extraActions?: React.ReactNode;
}

interface TestState {
  description: string;
  status: "idle" | "pending" | "passed" | "failed";
  message?: string;
}

/**
 * Рабочее место: редактор + кнопки управления + консоль + проверка тестами.
 * Исполняет код через выбранный адаптер (демо или Pyodide), никогда — на сервере.
 */
export function CodeWorkspace({
  code,
  onCodeChange,
  solution,
  expectedOutput,
  tests,
  hiddenTests,
  hint,
  title,
  rows = 12,
  onPassed,
  extraActions,
}: CodeWorkspaceProps) {
  const runnerMode = useSettingsStore((s) => s.runnerMode);
  const [value, setValue] = useState(code);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [testStates, setTestStates] = useState<TestState[]>([]);
  const [checking, setChecking] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  const change = useCallback(
    (next: string) => {
      setValue(next);
      onCodeChange?.(next);
    },
    [onCodeChange],
  );

  // Новый материал (другой урок/задача) — сбрасываем редактор и вывод.
  useEffect(() => {
    setValue(code);
    setResult(null);
    setTestStates([]);
    setShowSolution(false);
    setHintOpen(false);
  }, [code]);

  const run = useCallback(async () => {
    setRunning(true);
    try {
      const res = await getRunner().run(value);
      setResult(res);
    } finally {
      setRunning(false);
      setTimeout(() => consoleRef.current?.scrollIntoView({ block: "nearest" }), 50);
    }
  }, [value]);

  /** Прогон кода + набора assert-тестов; возвращает состояние каждого теста. */
  const runSuite = useCallback(
    async (suite: TaskTest[], label: (t: TaskTest, i: number) => string): Promise<TestState[]> => {
      const states: TestState[] = suite.map((t, i) => ({
        description: label(t, i),
        status: "pending" as const,
      }));
      setTestStates([...states]);

      for (let i = 0; i < suite.length; i++) {
        const res = await getRunner().run(`${value}\n\n${suite[i].code}`);
        states[i] = {
          description: label(suite[i], i),
          status: res.error ? "failed" : "passed",
          message: res.stderr || res.stdout,
        };
        setTestStates([...states]);
      }
      return states;
    },
    [value],
  );

  const check = useCallback(async () => {
    if (!tests || tests.length === 0) return;
    setChecking(true);
    try {
      const visible = await runSuite(tests, (t) => t.description);
      const visibleOk = visible.every((t) => t.status === "passed");
      if (visibleOk && hiddenTests && hiddenTests.length > 0) {
        const hidden = await runSuite(hiddenTests, (_t, i) => `Скрытый тест ${i + 1}`);
        const hiddenOk = hidden.every((t) => t.status === "passed");
        setTestStates([...visible, ...hidden]);
        if (hiddenOk) onPassed?.();
      } else if (visibleOk) {
        onPassed?.();
      }
    } finally {
      setChecking(false);
    }
  }, [tests, hiddenTests, runSuite, onPassed]);

  const reset = () => {
    change(code);
    setResult(null);
    setTestStates([]);
    setShowSolution(false);
  };

  const applySolution = () => {
    if (solution) {
      change(solution);
      setShowSolution(true);
    }
  };

  useEffect(() => {
    setResult(null);
    setTestStates([]);
  }, [runnerMode]);

  const visiblePassed = testStates.length > 0 && testStates.every((t) => t.status !== "failed");
  const allTestsRun = testStates.length > 0 && testStates.every((t) => t.status !== "pending");

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="text-xs text-muted-foreground">
            Исполнитель: {runnerMode === "pyodide" ? "Pyodide (настоящий Python)" : "демо-режим"}
          </span>
        </div>
      )}

      <CodeEditor
        value={value}
        onChange={change}
        onRun={run}
        rows={rows}
        ariaLabel={title ? `Редактор кода: ${title}` : "Редактор кода Python"}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={run} loading={running} aria-label="Запустить код">
          <Play className="h-4 w-4" aria-hidden="true" /> Запустить
        </Button>
        {solution && (
          <Button variant="outline" onClick={applySolution} aria-label="Показать решение">
            {showSolution ? "Решение показано" : "Показать решение"}
          </Button>
        )}
        <Button variant="ghost" onClick={reset} aria-label="Сбросить код">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Сбросить код
        </Button>
        {tests && tests.length > 0 && (
          <Button variant="success" onClick={check} loading={checking}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Проверить ответ
          </Button>
        )}
        {hint && (
          <Button variant="ghost" onClick={() => setHintOpen((v) => !v)} aria-expanded={hintOpen}>
            <Lightbulb className="h-4 w-4" aria-hidden="true" /> Подсказка
          </Button>
        )}
        {extraActions}
        <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
          Ctrl + Enter — запуск
        </kbd>
      </div>

      {hintOpen && hint && (
        <div className="animate-fade-in rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
          <p className="mb-1 font-medium">Подсказка</p>
          <p className="text-foreground/85">{hint}</p>
        </div>
      )}

      {expectedOutput && (
        <details className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
          <summary className="cursor-pointer font-medium">Ожидаемый результат</summary>
          <pre className="mt-2 overflow-x-auto font-mono text-xs text-foreground/80">
            {expectedOutput}
          </pre>
        </details>
      )}

      {/* Консоль */}
      <div
        ref={consoleRef}
        className="overflow-hidden rounded-xl border border-[#262c36] bg-[#0f141b]"
        aria-live="polite"
      >
        <div className="flex items-center justify-between border-b border-[#262c36] px-3 py-2">
          <span className="text-xs font-medium text-[#8b96a6]">Консоль вывода</span>
          {result && <span className="text-[11px] text-[#5f6b7c]">{result.durationMs} мс</span>}
        </div>
        <div className="max-h-64 overflow-auto p-3 font-mono text-[13px] leading-relaxed">
          {!result && !running && (
            <p className="text-[#5f6b7c]">
              Нажми «Запустить» — результат появится здесь. Код выполняется в браузере, на сервер
              ничего не отправляется.
            </p>
          )}
          {running && <p className="text-[#5f6b7c]">Выполняется…</p>}
          {result?.stdout && (
            <pre className="whitespace-pre-wrap text-[#d7dde5]">{result.stdout}</pre>
          )}
          {result?.stdout === "" && !result.error && (
            <p className="text-[#5f6b7c]">(программа не вывела ничего — используй print)</p>
          )}
          {result?.error && (
            <pre className="mt-1 whitespace-pre-wrap text-[#ff7b72]">
              {result.error.type}: {result.error.message}
              {result.error.line ? ` (строка ${result.error.line})` : ""}
            </pre>
          )}
          {result?.note && <p className="mt-2 text-[11px] text-[#5f6b7c]">{result.note}</p>}
        </div>
      </div>

      {/* Тесты */}
      {tests && tests.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Тесты ({tests.length}
            {hiddenTests && hiddenTests.length > 0 ? ` + ${hiddenTests.length} скрытых` : ""})
          </p>
          <ul className="space-y-2">
            {testStates.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Нажми «Проверить ответ» — прогоним твои тесты и скрытые случаи.
              </li>
            )}
            {testStates.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {t.status === "passed" && (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                )}
                {t.status === "failed" && (
                  <XCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                )}
                {t.status === "pending" && (
                  <span className="mt-1 h-3 w-3 shrink-0 animate-pulse rounded-full bg-muted-foreground/50" />
                )}
                <span className="min-w-0">
                  <span
                    className={cn(
                      t.status === "failed" && "text-destructive",
                      t.status === "passed" && "text-foreground",
                    )}
                  >
                    {t.description}
                  </span>
                  {t.status === "failed" && t.message && (
                    <span className="mt-0.5 block break-words font-mono text-xs text-destructive/90">
                      {t.message.split("\n").slice(-3).join("\n")}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {allTestsRun && (
            <div
              className={cn(
                "mt-3 flex items-center gap-2 rounded-lg p-2.5 text-sm",
                visiblePassed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
              )}
            >
              {visiblePassed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {visiblePassed
                ? "Все тесты пройдены — задача решена!"
                : "Есть непройденные тесты. Прочитай сообщение и попробуй ещё раз."}
            </div>
          )}
        </div>
      )}

      <details className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
        <summary className="flex cursor-pointer items-center gap-1.5 font-medium">
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> Разбор и пояснение
        </summary>
        <div className="pt-2 text-muted-foreground">
          {solution ? (
            <p>
              Нажми «Показать решение», чтобы вставить эталонный код в редактор, затем «Запустить» и
              сравни вывод.
            </p>
          ) : (
            <p>
              Попробуй сначала сам: сначала выведи промежуточные значения, потом ищи расхождение.
            </p>
          )}
        </div>
      </details>
    </div>
  );
}
