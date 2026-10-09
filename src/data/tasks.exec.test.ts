import { describe, expect, it } from "vitest";
import { tasks } from "@/data/tasks";
import { demoRunner } from "@/runner/demoRunner";

/**
 * Практические задачи — не текст: эталонное решение каждой задачи должно
 * запускаться в демо-исполнителе и проходить все открытые и скрытые тесты
 * (так же, как это делает CodeWorkspace при нажатии «Проверить»).
 */
describe("исполняемость задач практики", () => {
  it("эталонные решения запускаются без ошибок", async () => {
    expect(tasks.length).toBeGreaterThanOrEqual(20);
    const failures: string[] = [];
    for (const task of tasks) {
      const res = await demoRunner.run(task.solution);
      if (res.error) {
        failures.push(
          `${task.id}: ${res.error.type}: ${res.error.message} (строка ${res.error.line})`,
        );
      }
    }
    expect(failures, `Не запустились (${failures.length}):\n${failures.join("\n")}`).toEqual([]);
  }, 60_000);

  it("открытые и скрытые тесты проходят на эталонном решении", async () => {
    const failures: string[] = [];
    for (const task of tasks) {
      for (const suite of [...task.tests, ...task.hiddenTests]) {
        const res = await demoRunner.run(`${task.solution}\n\n${suite.code}`);
        if (res.error) {
          failures.push(
            `${task.id} / ${suite.description}: ${res.error.type} (строка ${res.error.line})`,
          );
        }
      }
    }
    expect(failures, `Упали проверки (${failures.length}):\n${failures.join("\n")}`).toEqual([]);
  }, 120_000);
});
