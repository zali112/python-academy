import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Eraser, Play, RotateCcw, Save, Terminal, FileCode2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CodeEditor } from "@/components/CodeEditor";
import { getRunner } from "@/runner";
import type { RunResult } from "@/runner/types";
import { useSettingsStore } from "@/store/settingsStore";
import { safeGet, safeSet } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";

const SNIPPETS_KEY = "python-academy-snippets";

const EXAMPLES: { id: string; title: string; code: string }[] = [
  {
    id: "hello",
    title: "Привет, мир",
    code: `# Первая программа
name = input("Как тебя зовут? ") if False else "ученик"
print("Привет,", name!)
print("2 + 2 =", 2 + 2)`,
  },
  {
    id: "loop",
    title: "Циклы и списки",
    code: `squares = [n * n for n in range(1, 8)]
print(squares)

total = 0
for n in squares:
    total += n
print("Сумма:", total)`,
  },
  {
    id: "dict",
    title: "Словари",
    code: `words = python.count("программирование") if False else {}

marks = {"алиса": 5, "борис": 4, "вера": 5}
for name, mark in marks.items():
    print(name, "->", mark)

print("Средний балл:", sum(marks.values()) / len(marks))`,
  },
  {
    id: "func",
    title: "Функции",
    code: `def fib(n: int) -> int:
    """Числа Фибоначчи — рекурсивно."""
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print([fib(i) for i in range(10)])`,
  },
  {
    id: "class",
    title: "Класс",
    code: `class Counter:
    def __init__(self, start=0):
        self.value = start

    def add(self, step=1):
        self.value += step
        return self.value

c = Counter(10)
c.add()
c.add(5)
print("Значение счётчика:", c.value)`,
  },
  {
    id: "error",
    title: "Обработка ошибок",
    code: `def to_int(text):
    try:
        return int(text)
    except ValueError as e:
        print("Не число:", e)
        return None

print(to_int("42"))
print(to_int("сорок два"))`,
  },
];

interface Snippet {
  id: string;
  title: string;
  code: string;
}

function loadSnippets(): Snippet[] {
  const raw = safeGet(SNIPPETS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => s && typeof s.code === "string") : [];
  } catch {
    return [];
  }
}

/** Песочница: свободный редактор, запуск в выбранном исполнителе, свои сниппеты. */
export function PlaygroundPage() {
  const runnerMode = useSettingsStore((s) => s.runnerMode);
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [exampleId, setExampleId] = useState(EXAMPLES[0].id);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>(() => loadSnippets());
  const consoleRef = useRef<HTMLDivElement>(null);

  const run = useCallback(async () => {
    setRunning(true);
    try {
      const res = await getRunner().run(code);
      setResult(res);
    } finally {
      setRunning(false);
      setTimeout(() => consoleRef.current?.scrollIntoView({ block: "nearest" }), 60);
    }
  }, [code]);

  const pickExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setExampleId(id);
    setCode(ex.code);
    setResult(null);
  };

  const clearAll = () => {
    setCode("");
    setResult(null);
    setExampleId("");
  };

  const saveSnippet = () => {
    const title = window.prompt("Название сниппета:", "Мой код");
    if (!title) return;
    const next = [
      ...snippets.filter((s) => s.title !== title),
      { id: String(Date.now()), title, code },
    ];
    setSnippets(next);
    safeSet(SNIPPETS_KEY, JSON.stringify(next));
    toast(`Сниппет «${title}» сохранён`, "success");
  };

  const removeSnippet = (id: string) => {
    const next = snippets.filter((s) => s.id !== id);
    setSnippets(next);
    safeSet(SNIPPETS_KEY, JSON.stringify(next));
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playground.py";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Песочница"
        description="Свободный редактор без условий и тестов: пиши что угодно, запускай Ctrl + Enter, сохраняй удачные сниппеты локально и скачивай как .py-файл."
        metaDescription="Онлайн-песочница Python: редактор кода с подсветкой, запуском в браузере и сохранением сниппетов."
        breadcrumbs={[{ label: "Песочница" }]}
        badge={
          <Badge tone="info">
            <Terminal className="h-3 w-3" aria-hidden="true" />
            {runnerMode === "pyodide" ? "Pyodide" : "демо-режим"}
          </Badge>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Пример:</span>
          <select
            value={exampleId}
            onChange={(e) => pickExample(e.target.value)}
            className="h-9 max-w-64 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-ring"
          >
            {EXAMPLES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
            {exampleId === "" && <option value="">(свой код)</option>}
          </select>
        </label>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button onClick={run} loading={running} aria-label="Запустить код">
            <Play className="h-4 w-4" aria-hidden="true" /> Запустить
          </Button>
          <Button variant="outline" onClick={saveSnippet} aria-label="Сохранить сниппет">
            <Save className="h-4 w-4" aria-hidden="true" /> Сохранить
          </Button>
          <Button variant="outline" onClick={download} aria-label="Скачать файл Python">
            <Download className="h-4 w-4" aria-hidden="true" /> .py
          </Button>
          <Button variant="ghost" onClick={clearAll} aria-label="Очистить редактор">
            <Eraser className="h-4 w-4" aria-hidden="true" /> Очистить
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            onRun={run}
            rows={20}
            ariaLabel="Песочница: редактор Python-кода"
          />

          <div
            ref={consoleRef}
            className="overflow-hidden rounded-xl border border-[#262c36] bg-[#0f141b]"
            aria-live="polite"
          >
            <div className="flex items-center justify-between border-b border-[#262c36] px-3 py-2">
              <span className="text-xs font-medium text-[#8b96a6]">Консоль вывода</span>
              {result && <span className="text-[11px] text-[#5f6b7c]">{result.durationMs} мс</span>}
            </div>
            <div className="max-h-80 overflow-auto p-3 font-mono text-[13px] leading-relaxed">
              {!result && !running && (
                <p className="text-[#5f6b7c]">
                  Ctrl + Enter — запустить. Код выполняется в браузере: никуда не отправляется и не
                  имеет доступа к файлам и сети твоей машины.
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
                <pre className="whitespace-pre-wrap text-[#ff7b72]">
                  {result.error.type}: {result.error.message}
                  {result.error.line ? ` (строка ${result.error.line})` : ""}
                </pre>
              )}
              {result?.note && <p className="mt-2 text-[11px] text-[#5f6b7c]">{result.note}</p>}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Свои сниппеты</h2>
            {snippets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Пока пусто. Напиши код и нажми «Сохранить» — сниппет останется в этом браузере.
              </p>
            ) : (
              <ul className="space-y-2">
                {snippets.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 rounded-lg border border-border p-2"
                  >
                    <FileCode2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-sm hover:text-primary"
                      onClick={() => {
                        setCode(s.code);
                        setResult(null);
                        setExampleId("");
                      }}
                      title={s.title}
                    >
                      {s.title}
                    </button>
                    <button
                      type="button"
                      aria-label={`Удалить сниппет ${s.title}`}
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                      onClick={() => removeSnippet(s.id)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Alert tone="info" title="Ограничения демо-режима">
            Встроенный интерпретатор покрывает учебное подмножество Python: переменные, циклы,
            функции, классы, файловые операции — в памяти. Для настоящего CPython переключись на
            Pyodide в настройках: тот же редактор, но полная стандартная библиотека.
          </Alert>
        </aside>
      </div>
    </div>
  );
}
