import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle, HelpCircle } from "lucide-react";
import type { QuizQuestion } from "@/types/content";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Answer = string | string[] | Record<string, string>;

export interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
  /** Ключ, при смене которого состояние сбрасывается (id урока/теста) */
  resetKey?: string;
}

function initialOrder(q: QuizQuestion): string[] {
  const seq = q.sequence ?? q.options?.map((o) => o.id) ?? [];
  // детерминированная перестановка: порядок «как в задании», если он задан
  return [...seq].reverse();
}

/** Тест с 8 типами вопросов и обязательным разбором после проверки. */
export function Quiz({ questions, onComplete, resetKey }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [checked, setChecked] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const shuffled = useMemo(
    () =>
      Object.fromEntries(
        questions.filter((q) => q.type === "order").map((q) => [q.id, initialOrder(q)]),
      ) as Record<string, string[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey],
  );

  const [orderState, setOrderState] = useState<Record<string, string[]>>(shuffled);

  useEffect(() => {
    setOrderState(shuffled);
    setAnswers({});
    setChecked(false);
  }, [shuffled]);

  const setAnswer = (id: string, value: Answer) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const isCorrect = (q: QuizQuestion): boolean => {
    const answer = answers[q.id];
    if (q.type === "multi" || q.type === "single") {
      const correct = (q.correct as string[]) ?? [];
      const given = Array.isArray(answer) ? answer : answer ? [answer] : [];
      return correct.length === given.length && correct.every((c) => given.includes(c));
    }
    if (q.type === "order") {
      const correct = q.sequence ?? [];
      const given = orderState[q.id] ?? [];
      return correct.length === given.length && correct.every((c, i) => given[i] === c);
    }
    if (q.type === "match") {
      const pairs = q.pairs ?? [];
      const given = (answer as Record<string, string>) ?? {};
      return pairs.every((p) => given[p.left] === p.right);
    }
    const normalize = (v: string) => v.trim().replace(/\s+/g, " ").toLowerCase();
    return normalize(String(answer ?? "")) === normalize(String(q.correct ?? ""));
  };

  const score = questions.filter(isCorrect).length;
  const total = questions.length;

  const check = () => {
    setChecked(true);
    setAttempt((a) => a + 1);
    onComplete?.(questions.filter(isCorrect).length, total);
  };

  const retry = () => {
    setChecked(false);
    setAnswers({});
    setOrderState(shuffled);
  };

  const move = (q: QuizQuestion, index: number, delta: number) => {
    const list = [...(orderState[q.id] ?? [])];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setOrderState((prev) => ({ ...prev, [q.id]: list }));
  };

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const answer = answers[q.id];
        const correct = checked && isCorrect(q);
        return (
          <fieldset
            key={q.id}
            className={cn(
              "rounded-xl border p-4 transition-colors sm:p-5",
              checked
                ? correct
                  ? "border-success/45 bg-success/5"
                  : "border-destructive/45 bg-destructive/5"
                : "border-border bg-card",
            )}
          >
            <legend className="sr-only">{q.question}</legend>
            <div className="mb-3 flex items-start gap-2">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                {qi + 1}
              </span>
              <p className="text-sm font-medium leading-relaxed sm:text-[15px]">{q.question}</p>
            </div>

            {/* single / multi / predict / bug */}
            {(q.type === "single" ||
              q.type === "multi" ||
              q.type === "predict" ||
              q.type === "bug") &&
              q.options && (
                <div role={q.type === "multi" ? "group" : "radiogroup"} className="space-y-2">
                  {q.options.map((opt) => {
                    const selected =
                      q.type === "multi"
                        ? Array.isArray(answer) && answer.includes(opt.id)
                        : answer === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-all",
                          selected
                            ? "border-primary/60 bg-primary/8"
                            : "border-border hover:border-ring/40 hover:bg-muted/60",
                        )}
                      >
                        <input
                          type={q.type === "multi" ? "checkbox" : "radio"}
                          name={`q-${q.id}`}
                          checked={selected}
                          disabled={checked}
                          onChange={() => {
                            if (q.type === "multi") {
                              const list = Array.isArray(answer) ? [...answer] : [];
                              setAnswer(
                                q.id,
                                list.includes(opt.id)
                                  ? list.filter((x) => x !== opt.id)
                                  : [...list, opt.id],
                              );
                            } else setAnswer(q.id, opt.id);
                          }}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                        />
                        <span className="leading-relaxed">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

            {/* input / fill / строковый ввод */}
            {(q.type === "input" || q.type === "fill") && (
              <input
                type="text"
                value={typeof answer === "string" ? answer : ""}
                disabled={checked}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="Введи ответ…"
                aria-label={`Ответ на вопрос ${qi + 1}`}
                className={cn(
                  "h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none transition-colors focus:border-ring",
                  checked && (correct ? "border-success" : "border-destructive"),
                )}
              />
            )}

            {/* order — порядок шагов */}
            {q.type === "order" && (
              <ol className="space-y-2">
                {(orderState[q.id] ?? []).map((item, index) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <span className="w-5 text-xs font-bold text-muted-foreground">{index + 1}</span>
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      disabled={checked || index === 0}
                      onClick={() => move(q, index, -1)}
                      aria-label={`Поднять «${item}»`}
                      className="rounded px-2 py-1 text-xs hover:bg-muted disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={checked || index === (orderState[q.id]?.length ?? 0) - 1}
                      onClick={() => move(q, index, 1)}
                      aria-label={`Опустить «${item}»`}
                      className="rounded px-2 py-1 text-xs hover:bg-muted disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {/* match — сопоставление */}
            {q.type === "match" && (
              <div className="space-y-2">
                {(q.pairs ?? []).map((pair) => {
                  const map = (answer as Record<string, string>) ?? {};
                  return (
                    <div key={pair.left} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="min-w-[40%] flex-1 rounded-lg border border-border bg-background px-3 py-2">
                        {pair.left}
                      </span>
                      <span aria-hidden="true">→</span>
                      <select
                        value={map[pair.left] ?? ""}
                        disabled={checked}
                        onChange={(e) => setAnswer(q.id, { ...map, [pair.left]: e.target.value })}
                        aria-label={`Сопоставление для «${pair.left}»`}
                        className="h-10 flex-1 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-ring"
                      >
                        <option value="">выбери вариант</option>
                        {(q.pairs ?? []).map((p) => (
                          <option key={p.right} value={p.right}>
                            {p.right}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Разбор */}
            {checked && (
              <div
                className={cn(
                  "mt-3 animate-fade-in rounded-lg p-3 text-sm",
                  correct ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive",
                )}
              >
                <p className="mb-1 flex items-center gap-1.5 font-semibold">
                  {correct ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                  )}
                  {correct ? "Верно" : "Неверно"}
                </p>
                <p className="text-foreground/85">{q.explanation}</p>
                {!correct && q.type === "input" && (
                  <p className="mt-1 font-mono text-xs">Правильный ответ: {String(q.correct)}</p>
                )}
              </div>
            )}

            {q.hint && !checked && (
              <details className="mt-3 text-xs text-muted-foreground">
                <summary className="inline-flex cursor-pointer items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" /> Нужна подсказка?
                </summary>
                <p className="mt-1">{q.hint}</p>
              </details>
            )}
          </fieldset>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        {!checked ? (
          <Button onClick={check}>Проверить ответы</Button>
        ) : (
          <>
            <Button variant="outline" onClick={retry}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Пройти заново
            </Button>
            <span
              className={cn(
                "text-sm font-medium",
                score === total ? "text-success" : "text-muted-foreground",
              )}
              role="status"
            >
              Результат: {score} из {total}
              {attempt > 1 ? ` (попытка ${attempt})` : ""}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
